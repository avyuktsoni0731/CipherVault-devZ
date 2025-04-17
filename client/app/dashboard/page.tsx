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

// Mock data for files
// const mockFiles = [
//   {
//     id: 1,
//     name: "Project Proposal.docx",
//     type: "document",
//     size: "2.4 MB",
//     encrypted: true,
//     date: "2025-04-15",
//   },
//   {
//     id: 2,
//     name: "Financial Report.xlsx",
//     type: "spreadsheet",
//     size: "1.8 MB",
//     encrypted: true,
//     date: "2025-04-14",
//   },
//   {
//     id: 3,
//     name: "Presentation.pptx",
//     type: "presentation",
//     size: "5.2 MB",
//     encrypted: true,
//     date: "2025-04-13",
//   },
//   {
//     id: 4,
//     name: "Contract.pdf",
//     type: "pdf",
//     size: "3.1 MB",
//     encrypted: true,
//     date: "2025-04-12",
//   },
//   {
//     id: 5,
//     name: "Logo.png",
//     type: "image",
//     size: "0.8 MB",
//     encrypted: false,
//     date: "2025-04-11",
//   },
// ];

type FileItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  encrypted: boolean;
  date: string;
};

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [downloadKey, setDownloadKey] = useState("");
  const [keyError, setKeyError] = useState(false);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  //   const filteredFiles = mockFiles.filter((file) =>
  //     file.name.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/files", {
          method: "GET",
          credentials: "include", // This is important
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

    fetchFiles();
  }, []);

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setIsUploadOpen(false);

          // Generate a random key for demo purposes
          setEncryptionKey("a8f5e7c3d9b2f1e0");
          setShowKeyModal(true);
        }, 500);
      }
    }, 300);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(encryptionKey);
  };

  const handleDownloadClick = (fileId: number) => {
    setSelectedFileId(fileId);
    setShowDownloadModal(true);
    setDownloadKey("");
    setKeyError(false);
  };

  const handleDownload = () => {
    // In a real app, this would verify the key with the backend
    // For demo purposes, we'll simulate key verification
    if (downloadKey === "a8f5e7c3d9b2f1e0") {
      // Key is correct, proceed with download
      setShowDownloadModal(false);
      // Simulate download
      setTimeout(() => {
        alert("File decrypted and downloaded successfully!");
      }, 500);
    } else {
      // Key is incorrect
      setKeyError(true);
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
              <span className="text-xl font-bold">SecureVault</span>
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
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Lock className="h-4 w-4" />
                      <span>Encrypted</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
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
            </SidebarGroup>
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
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
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
                      <div className="col-span-5 flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <div className="col-span-2 text-gray-500 text-sm">
                        {file.size}
                      </div>
                      <div className="col-span-2">
                        {file.encrypted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Lock className="mr-1 h-3 w-3" />
                            Encrypted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Unencrypted
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-gray-500 text-sm">
                        {file.date}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadClick(file.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          Download
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

      {/* Download Key Modal */}
      <DownloadModal
        open={showDownloadModal}
        onOpenChange={setShowDownloadModal}
        downloadKey={downloadKey}
        setDownloadKey={setDownloadKey}
        keyError={keyError}
        setKeyError={setKeyError}
        onDownload={handleDownload}
      />
    </SidebarProvider>
  );
}
