from flask import Flask, redirect, url_for, session, request, jsonify, Response
from google.oauth2 import credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
from google.auth.transport.requests import Request
from dotenv import load_dotenv
import os
import io
import hashlib
from datetime import timedelta

from flask_cors import CORS

load_dotenv()
app = Flask(__name__)

# Enhanced CORS configuration
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type"]
)

# Session configuration
app.secret_key = os.getenv('FLASK_SECRET_KEY')
app.config.update(
    SESSION_COOKIE_SECURE=False,  # Should be True in production
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1)
)

# Google OAuth config
CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
REDIRECT_URIS = os.getenv('GOOGLE_REDIRECT_URIS').split(',')
SCOPES = ['https://www.googleapis.com/auth/drive.file']

@app.before_request
def handle_options_request():
    if request.method == "OPTIONS":
        return "", 200

@app.before_request
def check_auth():
    # Skip auth check for these routes
    if request.path in ['/auth', '/auth/callback', '/']:
        return
    
    if 'credentials' not in session:
        return jsonify({"error": "Unauthorized"}), 401

def get_redirect_uri():
    return REDIRECT_URIS[0]

@app.route('/')
def index():
    if 'credentials' not in session:
        return redirect(url_for('auth'))
    return redirect('http://localhost:3000/dashboard')

@app.route('/auth')
def auth():
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": REDIRECT_URIS
            }
        },
        scopes=SCOPES,
        redirect_uri=get_redirect_uri()
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='false'
    )
    session['state'] = state
    return redirect(authorization_url)

@app.route('/auth/callback')
def auth_callback():
    state = session.get('state')
    if not state:
        return jsonify({"error": "State missing from session"}), 400

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": REDIRECT_URIS
            }
        },
        scopes=SCOPES,
        state=state,
        redirect_uri=get_redirect_uri()
    )

    try:
        flow.fetch_token(authorization_response=request.url)
    except Exception as e:
        return jsonify({"error": f"Token fetch error: {str(e)}"}), 400

    creds = flow.credentials
    session['credentials'] = {
        'token': creds.token,
        'refresh_token': creds.refresh_token,
        'token_uri': creds.token_uri,
        'client_id': creds.client_id,
        'client_secret': creds.client_secret,
        'scopes': creds.scopes
    }
    return redirect('http://localhost:3000/dashboard')

def get_drive_service():
    creds_data = session.get('credentials')
    if not creds_data:
        return None

    creds = credentials.Credentials(**creds_data)
    if creds.expired:
        creds.refresh(Request())
        session['credentials']['token'] = creds.token

    return build('drive', 'v3', credentials=creds)

@app.route('/api/files', methods=['GET'])
def get_files():
    drive_service = get_drive_service()
    if not drive_service:
        return jsonify({"error": "Unauthorized"}), 401

    print("SESSION:", session)

    try:
        results = drive_service.files().list(
            q="name contains '.encr'",  # Filter for files with .encr extension
            fields="files(id, name, appProperties)"
        ).execute()
        files = results.get('files', [])

        # Log the fetched files for debugging
        print("Fetched files:", files)

        # Add original filenames to the file list
        for file in files:
            file['original_filename'] = file.get('appProperties', {}).get('original_filename', file['name'])

        return jsonify({"files": files})

    #     # Modified query to match the working version
    #     results = drive_service.files().list(
    #         q="name contains '.encr'",
    #         fields="files(id, name, mimeType, modifiedTime, size, description, appProperties)",
    #         pageSize=100
    #     ).execute()

    #     files = results.get('files', [])
    #     print(f"Found {len(files)} files in Drive")  # Debug output

    #     formatted_files = []
    #     for file in files:
    #         # Extract original filename or fallback to name without .encr
    #         original_name = file.get('appProperties', {}).get('original_filename', 
    #                         file['name'].replace('.encr', ''))
            
    #         # Determine file type based on mimeType
    #         mime_type = file.get('mimeType', '')
    #         file_type = 'document'
    #         if 'spreadsheet' in mime_type:
    #             file_type = 'spreadsheet'
    #         elif 'presentation' in mime_type:
    #             file_type = 'presentation'
    #         elif 'pdf' in mime_type:
    #             file_type = 'pdf'
    #         elif 'image' in mime_type:
    #             file_type = 'image'

    #         formatted_files.append({
    #             "id": file["id"],
    #             "name": original_name,
    #             "type": file_type,
    #             "size": file.get('size', '?'),
    #             "encrypted": True,
    #             "date": file.get('modifiedTime', '')
    #         })

    #     return jsonify({"files": formatted_files})

    except Exception as e:
        print(f"Error fetching files: {str(e)}")  # Debug output
        return jsonify({"error": str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    drive_service = get_drive_service()
    if not drive_service:
        return jsonify({"error": "Unauthorized"}), 401

    file = request.files['file']
    file_data = file.read()

    key = Fernet.generate_key()
    cipher = Fernet(key)
    encrypted_data = cipher.encrypt(file_data)
    key_hash = hashlib.sha256(key).hexdigest()

    encrypted_filename = file.filename + '.encr'
    original_filename = file.filename

    file_metadata = {
        'name': encrypted_filename,
        'description': f"KeyHash: {key_hash}",
        'appProperties': {
            'original_filename': original_filename
        },
        'mimeType': 'application/octet-stream'
    }
    media = MediaIoBaseUpload(io.BytesIO(encrypted_data), mimetype='application/octet-stream')
    drive_service.files().create(body=file_metadata, media_body=media, fields='id').execute()

    return jsonify({
        "message": "File uploaded and encrypted successfully.",
        "encryptionKey": key.decode()
    })

@app.route('/download/<file_id>', methods=['POST'])
def download_file(file_id):
    drive_service = get_drive_service()
    if not drive_service:
        return jsonify({"error": "Unauthorized"}), 401

    file = drive_service.files().get(fileId=file_id, fields='id, name, description, appProperties').execute()
    expected_hash = file.get('description', '').replace("KeyHash: ", "")
    original_filename = file.get('appProperties', {}).get('original_filename', file['name'].replace('.encr', ''))

    try:
        user_key = request.get_json().get("key", "").encode()
        user_key_hash = hashlib.sha256(user_key).hexdigest()

        if user_key_hash != expected_hash:
            return jsonify({"error": "Invalid key"}), 403

        request_media = drive_service.files().get_media(fileId=file_id)
        file_content = request_media.execute()

        cipher = Fernet(user_key)
        decrypted_data = cipher.decrypt(file_content)

        return Response(
            decrypted_data,
            headers={
                "Content-Disposition": f"attachment; filename={original_filename}",
                "Content-Type": "application/octet-stream"
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/logout')
def logout():
    session.clear()
    return redirect('http://localhost:3000')  # or homepage route

if __name__ == '__main__':
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # Only for local development
    app.run(debug=True)
