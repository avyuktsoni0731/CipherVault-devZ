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
from datetime import timedelta, datetime
import json

# from transformers import AutoTokenizer, pipeline

from flask_cors import CORS

load_dotenv()
app = Flask(__name__)

# Enhanced CORS configuration
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://ciphervaultai.vercel.app"],
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


# # Load model & tokenizer once at the top of app.py
# risk_classifier = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-sms-spam-detection")
# tokenizer = AutoTokenizer.from_pretrained("mrm8488/bert-tiny-finetuned-sms-spam-detection")
# risk_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")


# Google OAuth config
CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
REDIRECT_URIS = os.getenv('GOOGLE_REDIRECT_URIS').split(',')
# SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.profile']
SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid"
]


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

# def get_redirect_uri():
#     return REDIRECT_URIS[0]

def get_redirect_uri():
    return "https://ciphervault-server.onrender.com/auth/callback"

@app.route('/')
def index():
    if 'credentials' not in session:
        return redirect(url_for('auth'))
    return redirect('https://ciphervaultai.vercel.app/dashboard')

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
    return redirect('https://ciphervaultai.vercel.app/dashboard')

def get_credentials():
    creds_data = session.get("credentials")
    if not creds_data:
        return None

    creds = credentials.Credentials(**creds_data)
    if creds.expired:
        creds.refresh(Request())
        session["credentials"]["token"] = creds.token

    return creds


def get_drive_service():
    creds_data = session.get('credentials')
    if not creds_data:
        return None

    creds = credentials.Credentials(**creds_data)
    if creds.expired:
        creds.refresh(Request())
        session['credentials']['token'] = creds.token

    return build('drive', 'v3', credentials=creds)

@app.route("/api/user_info", methods=["GET"])
def user_info():
    creds = get_credentials()
    if not creds:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        # Use OAuth2 API to fetch user profile info
        oauth2_service = build("oauth2", "v2", credentials=creds)
        user_info = oauth2_service.userinfo().get().execute()

        return jsonify({
            "user": {
                "name": user_info.get("name"),
                "email": user_info.get("email"),
                "picture": user_info.get("picture"),
            }
        })
    except Exception as e:
        print("User info fetch error:", e)
        return jsonify({"error": "Failed to retrieve user info"}), 500


@app.route("/api/files", methods=["GET"])
def get_files():
    # print(session)
    drive_service = get_drive_service()
    if not drive_service:
        return jsonify({"error": "Unauthorized"}), 401

    results = drive_service.files().list(
        q="name contains '.encr' and trashed = false",
        fields="files(id, name, modifiedTime, size, mimeType, appProperties)"
    ).execute()

    files = results.get("files", [])
    return jsonify({
        "files": [
            {
                "id": f["id"],
                "name": f.get("appProperties", {}).get("original_filename", f["name"].replace(".encr", "")),
                "date": f.get("modifiedTime", ""),
                "size": f.get("size", "?"),
                "type": f.get("mimeType", "file"),
                "encrypted": True,
                "one_time": f.get("appProperties", {}).get("one_time", "false"),
                "expired": f.get("appProperties", {}).get("expired", "false"),
            }
            for f in files
        ]
    })

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

    one_time = request.form.get("one_time", "false")  # 'true' or 'false'

    file_metadata = {
        'name': encrypted_filename,
        'description': f"KeyHash: {key_hash}",
        'appProperties': {
            'original_filename': original_filename,
            'one_time': one_time,
            'expired': "false",       # always false initially
            'logs': "[]",             # empty log list
        },
        'mimeType': 'application/octet-stream'
    }
    media = MediaIoBaseUpload(io.BytesIO(encrypted_data), mimetype='application/octet-stream')
    drive_service.files().create(body=file_metadata, media_body=media, fields='id').execute()

    return jsonify({
        "message": "File uploaded and encrypted successfully.",
        "encryptionKey": key.decode()
    })

# @app.route('/download/<file_id>', methods=['POST'])
# def download_file(file_id):
#     drive_service = get_drive_service()
#     if not drive_service:
#         return jsonify({"error": "Unauthorized"}), 401

#     file = drive_service.files().get(fileId=file_id, fields='id, name, description, appProperties').execute()
#     expected_hash = file.get('description', '').replace("KeyHash: ", "")
#     original_filename = file.get('appProperties', {}).get('original_filename', file['name'].replace('.encr', ''))

#     try:
#         user_key = request.get_json().get("key", "").encode()
#         user_key_hash = hashlib.sha256(user_key).hexdigest()

#         if user_key_hash != expected_hash:
#             return jsonify({"error": "Invalid key"}), 403

#         request_media = drive_service.files().get_media(fileId=file_id)
#         file_content = request_media.execute()

#         cipher = Fernet(user_key)
#         decrypted_data = cipher.decrypt(file_content)

#         print(original_filename)
#         return Response(
#             decrypted_data,
#             headers={
#                 "Content-Disposition": f"attachment; filename={original_filename}",
#                 "Content-Type": "application/octet-stream",
#                 "Original-Filename": f"{original_filename}"
#             }
#         )

#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

@app.route('/download/<file_id>', methods=['POST'])
def download_file(file_id):
    drive_service = get_drive_service()
    if not drive_service:
        return jsonify({"error": "Unauthorized"}), 401

    file = drive_service.files().get(fileId=file_id, fields='id, name, description, appProperties').execute()
    expected_hash = file.get('description', '').replace("KeyHash: ", "")
    props = file.get('appProperties', {}) or {}
    original_filename = props.get('original_filename', file['name'].replace('.encr', ''))

    # ⛔ Check if already downloaded (one-time access)
    if props.get("one_time") == "true" and props.get("expired") == "true":
        return jsonify({"error": "This file was allowed for one-time download and has already been accessed."}), 403

    try:
        user_key = request.get_json().get("key", "").encode()
        user_key_hash = hashlib.sha256(user_key).hexdigest()

        if user_key_hash != expected_hash:
            return jsonify({"error": "Invalid key"}), 403

        # ⬇️ Download and decrypt
        request_media = drive_service.files().get_media(fileId=file_id)
        file_content = request_media.execute()
        cipher = Fernet(user_key)
        decrypted_data = cipher.decrypt(file_content)

        # ✅ Update access logs
        logs = json.loads(props.get("logs", "[]"))
        logs.append({
            "time": datetime.now().isoformat(),
            "ip": request.remote_addr
        })
        props["logs"] = json.dumps(logs)

        # ✅ Mark as expired if one-time download
        if props.get("one_time") == "true":
            props["expired"] = "true"

        # Update file metadata
        drive_service.files().update(
            fileId=file_id,
            body={"appProperties": props}
        ).execute()

        # ⬇️ Return decrypted file
        return Response(
            decrypted_data,
            headers={
                "Content-Disposition": f"attachment; filename={original_filename}",
                "Content-Type": "application/octet-stream",
                "Original-Filename": f"{original_filename}"
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/logs/<file_id>", methods=["GET"])
def get_logs(file_id):
    drive = get_drive_service()
    if not drive:
        return jsonify({"error": "Unauthorized"}), 401

    file = drive.files().get(fileId=file_id, fields="appProperties").execute()
    logs = json.loads(file.get("appProperties", {}).get("logs", "[]"))
    return jsonify({"logs": logs})


# @app.route("/analyze/<file_id>", methods=["POST"])
# def analyze_file(file_id):
#     drive_service = get_drive_service()
#     if not drive_service:
#         return jsonify({"error": "Unauthorized"}), 401

#     file = drive_service.files().get(fileId=file_id, fields="name, description").execute()
#     stored_hash = file.get("description", "").replace("KeyHash: ", "")

#     data = request.get_json()
#     key = data.get("key", "").encode()
#     user_hash = hashlib.sha256(key).hexdigest()
#     if user_hash != stored_hash:
#         return jsonify({"error": "Invalid key"}), 403

#     try:
#         file_content = drive_service.files().get_media(fileId=file_id).execute()
#         decrypted_content = Fernet(key).decrypt(file_content).decode(errors="ignore")

#         # ✅ NEW ZERO-SHOT CLASSIFIER USAGE
#         result = risk_classifier(
#             decrypted_content[:1000],
#             candidate_labels=["Low", "Moderate", "High"]
#         )

#         risk_level = result["labels"][0]
#         score = int(result["scores"][0] * 100)
#         summary = f"AI classified this as '{risk_level}' risk with confidence {score}%"

#         return jsonify({
#             "risk_level": risk_level,
#             "score": score,
#             "summary": summary,
#         })

#     except Exception as e:
#         print("🔥 Analysis error:", e)
#         return jsonify({"error": "Internal server error"}), 500

@app.route('/logout')
def logout():
    session.clear()
    return redirect('https://ciphervaultai.vercel.app')  # or homepage route
    # return redirect('http://localhost:3000')  # or homepage route

if __name__ == '__main__':
    # os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # Only for local development
    # app.run(host='localhost', port=5000, debug=True)
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
