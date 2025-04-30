"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Upload,
  FolderPlus,
  File,
  LogOut,
  Settings,
  User,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { EncryptionKeyModal } from "./encryption-key-modal";
import { DownloadModal } from "./download-modal";
import { AccessLogModal } from "./access-log-modal";
import { Badge } from "@/components/ui/badge";

type FileItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  encrypted: boolean;
  date: string;
  expired?: string;
  one_time?: string;
};

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [downloadKey, setDownloadKey] = useState("");
  const [keyError, setKeyError] = useState(false);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [originalFileName, setOriginalFileName] = useState("");
  const [oneTime, setOneTime] = useState(false);

  const [showLogModal, setShowLogModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedLogFileId, setSelectedLogFileId] = useState<string | null>(
    null
  );

  const [user, setUser] = useState<{
    name: string;
    email: string;
    picture: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      // const res = await fetch(
      //   // "https://9612-2401-4900-a07d-f0e1-4944-b664-ec88-72ed.ngrok-free.app/api/user_info",
      //   "https://ciphervault-server.onrender.com/api/user_info",
      //   {
      const res = await fetch("http://localhost:5000/api/user_info", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  const fetchFiles = async () => {
    try {
      // const res = await fetch(
      //   // "https://9612-2401-4900-a07d-f0e1-4944-b664-ec88-72ed.ngrok-free.app/api/files",
      //   "https://ciphervault-server.onrender.com/api/files",
      //   {
      const res = await fetch("http://localhost:5000/api/files", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error("Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatFileSize(bytes: string | number): string {
    const size = typeof bytes === "string" ? parseInt(bytes) : bytes;
    if (isNaN(size)) return "?";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let formattedSize = size;

    while (formattedSize >= 1024 && i < units.length - 1) {
      formattedSize /= 1024;
      i++;
    }

    return `${formattedSize.toFixed(1)} ${units[i]}`;
  }

  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const fileInput = document.getElementById("file") as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setEncryptionKey("");
    setShowKeyModal(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("one_time", oneTime ? "true" : "false");

    const xhr = new XMLHttpRequest();
    // xhr.open(
    //   "POST",
    //   "https://9612-2401-4900-a07d-f0e1-4944-b664-ec88-72ed.ngrok-free.app/upload"
    // );
    // xhr.open("POST", "https://ciphervault-server.onrender.com/upload");
    xhr.open("POST", "http://localhost:5000/upload");
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      setUploadProgress(0);
      setIsUploadOpen(false);

      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        setEncryptionKey(response.encryptionKey);
        setShowKeyModal(true);
        fetchFiles(); // refresh dashboard
      } else {
        console.error("Upload failed:", xhr.responseText);
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      console.error("Upload error");
    };

    xhr.send(formData);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(encryptionKey);
  };

  const handleDownload = async () => {
    if (!selectedFileId || !downloadKey) return;

    try {
      const res = await fetch(
        // `https://9612-2401-4900-a07d-f0e1-4944-b664-ec88-72ed.ngrok-free.app/download/${selectedFileId}`,
        // `https://ciphervault-server.onrender.com/download/${selectedFileId}`,
        `http://localhost:5000/download/${selectedFileId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: downloadKey }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        setKeyError(true);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = originalFileName; // you can make this smarter if you pass filename too
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Reset modal
      setIsDownloadModalOpen(false);
      setDownloadKey("");
      setKeyError(false);
      setSelectedFileId(null);
    } catch (err) {
      console.error("Download failed", err);
      setKeyError(true);
    }
  };

  const fetchLogs = async (fileId: string) => {
    try {
      // const res = await fetch(
      //   // `https://9612-2401-4900-a07d-f0e1-4944-b664-ec88-72ed.ngrok-free.app/logs/${fileId}`,
      //   `https://ciphervault-server.onrender.com/logs/${fileId}`,
      //   {
      const res = await fetch(`http://localhost:5000/logs/${fileId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setSelectedLogFileId(fileId);
      setShowLogModal(true);
    } catch (err) {
      console.error("Failed to load logs", err);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <File className="h-6 w-6 text-blue-500" />;
      case "spreadsheet":
        return <File className="h-6 w-6 text-green-500" />;
      case "presentation":
        return <File className="h-6 w-6 text-orange-500" />;
      case "pdf":
        return <File className="h-6 w-6 text-red-500" />;
      case "image":
        return <File className="h-6 w-6 text-purple-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-screen h-screen bg-gray-50">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold">CipherVault.ai</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Storage</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <File className="h-4 w-4" />
                      <span>My Files</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {/* <SidebarGroup>
              <SidebarGroupLabel>AI Features</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <AlertCircle className="h-4 w-4" />
                      <span>Security Insights</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup> */}
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="border-b bg-white">
            <div className="flex items-center justify-between h-16 px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload & Encrypt File</DialogTitle>
                      <DialogDescription>
                        Your file will be encrypted with SHA-256 before being
                        stored on Google Drive.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload}>
                      <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                          <label htmlFor="file" className="text-sm font-medium">
                            Select File
                          </label>
                          <Input id="file" type="file" required />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="one-time"
                            checked={oneTime}
                            onChange={(e) => setOneTime(e.target.checked)}
                          />
                          <label htmlFor="one-time" className="text-sm">
                            Allow only one-time download
                          </label>
                        </div>

                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Encrypting & uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsUploadOpen(false)}
                          disabled={isUploading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={isUploading}
                        >
                          {isUploading ? "Uploading..." : "Upload & Encrypt"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src={user?.picture || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback>
                        {user?.name
                          ? user.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-sm">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href =
                          // "https://9612-2401-4900-a07d-f0e1-4944-b664-ec88-72ed.ngrok-free.app/logout"; // or your prod URL
                          // "https://ciphervault-server.onrender.com/logout"; // or your prod URL
                          window.location.href = "http://localhost:5000/logout"; // or your prod URL
                      }}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-col overflow-auto p-16">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">My Files</h1>
              <p className="text-gray-500">Manage your secure files</p>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
              <div className="grid grid-cols-12 gap-4 p-4 border-b text-sm font-medium text-gray-500">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Modified</div>
                <div className="col-span-1"></div>
              </div>
              <div className="divide-y">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50"
                    >
                      {/* <div className="col-span-5 flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="font-medium">{file.name}</span>
                      </div> */}
                      <div className="col-span-5 flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="font-medium">{file.name}</span>
                        {file.one_time === "true" && (
                          <span className="text-xs text-red-500">
                            One-time download
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 text-gray-500 text-sm">
                        {formatFileSize(file.size)}
                      </div>
                      <div className="col-span-2">
                        {file.encrypted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Lock className="mr-1 h-3 w-3" />
                            Encrypted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Unencrypted
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-gray-500 text-sm pr-24">
                        {formatDate(file.date)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {/* <Button
                          variant="default"
                          size="sm"
                          className="mr-4"
                          onClick={() => {
                            setSelectedFileId(file.id);
                            setOriginalFileName(file.name); // <– 👈 add this state too
                            setIsDownloadModalOpen(true);
                            setDownloadKey("");
                            setKeyError(false);
                          }}
                        >
                          Download
                        </Button>
                        <Button
                          onClick={() => fetchLogs(file.id)}
                          variant="secondary"
                        >
                          View Logs
                        </Button> */}
                        {file.expired === "true" ? (
                          <Badge variant="destructive" className="mr-4">
                            Expired
                          </Badge>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="mr-4"
                            onClick={() => {
                              setSelectedFileId(file.id);
                              setOriginalFileName(file.name);
                              setIsDownloadModalOpen(true);
                              setDownloadKey("");
                              setKeyError(false);
                            }}
                          >
                            Download
                          </Button>
                        )}
                        <Button
                          onClick={() => fetchLogs(file.id)}
                          variant="secondary"
                        >
                          View Logs
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No files found. Try a different search or upload a new file.
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Encryption Key Modal */}
      <EncryptionKeyModal
        open={showKeyModal}
        onOpenChange={setShowKeyModal}
        encryptionKey={encryptionKey}
        onCopyKey={handleCopyKey}
      />

      <DownloadModal
        open={isDownloadModalOpen}
        onOpenChange={setIsDownloadModalOpen}
        downloadKey={downloadKey}
        setDownloadKey={setDownloadKey}
        keyError={keyError}
        setKeyError={setKeyError}
        onDownload={handleDownload}
      />
      <AccessLogModal
        open={showLogModal}
        onOpenChange={setShowLogModal}
        logs={logs}
      />
    </SidebarProvider>
  );
}
