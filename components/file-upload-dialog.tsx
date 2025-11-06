"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud, X, File, Check } from "lucide-react"
// import { supabase } from "@/lib/supabaseClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

interface FileUploadDialogProps {
  clientId: string
  clientName: string
  trigger?: React.ReactNode
  onUploadComplete?: () => void
  enableUploadType?: boolean
}

export function FileUploadDialog({ clientId, clientName, trigger, onUploadComplete, enableUploadType }: FileUploadDialogProps) {
  const [uploadType, setUploadType] = useState<"documents" | "agreements" | "">("");
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...fileArray])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...fileArray])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  
  const handleUpload = async () => {
  if (files.length === 0) return;

  setUploading(true);
  setProgress(0);

  const interval = setInterval(() => {
    setProgress((prev) => {
      if (prev >= 100) {
        clearInterval(interval);
        return 100;
      }
      return prev + 10;
    });
  }, 150);

  const formData = new FormData();
  formData.append("file", files[0]); // or loop if you support multi
  formData.append("clientId", clientId);
  formData.append("uploadType", uploadType); // new line

  try {
    const res = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    setProgress(100);
    setUploading(false);
    setUploadComplete(true); 
    
    // ✅ Trigger parent refresh and keep user on Documents tab
    if (onUploadComplete) onUploadComplete();

    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
      setProgress(0);
    }
  };

  // const handleClose = () => {
  //   if (uploadComplete && onUploadComplete) {
  //     onUploadComplete()
  //   }
  //   setOpen(false)
  //   setFiles([])
  //   setProgress(0)
  //   setUploadComplete(false)
  // }
  const handleClose = () => {
    setOpen(false);
    setFiles([]);
    setProgress(0);
    setUploadComplete(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload documents for {clientName} (Company ID: {clientId})
          </DialogDescription>
        </DialogHeader>

        {enableUploadType && (
            <div className="mb-4">
              <Label className="text-sm font-medium">Select Upload Type</Label>
              <div className="flex gap-3 mt-2">
                <Button
                  variant={uploadType === "documents" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUploadType("documents")}
                >
                  Documents
                </Button>
                <Button
                  variant={uploadType === "agreements" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUploadType("agreements")}
                >
                  Agreements
                </Button>
              </div>
            </div>
          )}

        {!uploading && !uploadComplete && (
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium">Drag and drop files here</h3>
            <p className="text-xs text-gray-500 mt-1">or click to browse</p>
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
            />
          </div>
        )}

        {uploading && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading {files.length} file(s)...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </div>
        )}

        {uploadComplete && (
          <div className="py-6 text-center">
            <div className="bg-green-50 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-600">Upload Complete</h3>
            <p className="text-sm text-gray-500 mt-1">{files.length} file(s) have been successfully uploaded</p>
          </div>
        )}

        {files.length > 0 && !uploading && !uploadComplete && (
          <div className="max-h-[200px] overflow-y-auto mt-4">
            <Label className="text-sm font-medium">Selected Files</Label>
            <ul className="mt-2 space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center">
                    <File className="h-4 w-4 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <p className="font-medium truncate max-w-[180px]">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          {!uploadComplete ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={uploading}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={files.length === 0 || uploading || !uploadType}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="ml-auto">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
