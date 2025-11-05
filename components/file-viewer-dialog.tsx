"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileText, FileImage, FileArchive, File, Search, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Document {
  file_name: string
  file_url: string
  created_at: string
  size: string
}

interface FileViewerDialogProps {
  clientId: string
  clientName: string
  trigger?: React.ReactNode
}

export function FileViewerDialog({ clientId, clientName, trigger }: FileViewerDialogProps) {
  const [open, setOpen] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [agreements, setAgreements] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!open) return;

      try {
        const res = await fetch(`/api/files/get?clientId=${clientId}`);
        const { documents, agreements } = await res.json();
        setDocuments(documents || []);
        setAgreements(agreements || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };

    fetchDocuments();
  }, [open, clientId]);

  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "jpg":
      case "jpeg":
      case "png":
        return <FileImage className="h-4 w-4 text-blue-500" />
      case "zip":
        return <FileArchive className="h-4 w-4 text-yellow-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const filterDocs = (docs: Document[]) =>
    docs.filter((doc) => doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDownload = async (blobPath: string) => {
    try {
      const res = await fetch(`/api/files/download-url?blobPath=${encodeURIComponent(blobPath)}`);
      const { url } = await res.json();
      if (url) window.open(url, "_blank");
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const renderTable = (title: string, items: Document[], folder: "documents" | "agreements") => {
    const filteredItems = filterDocs(items);

    return (
      <>
        <h4 className="text-lg font-semibold mt-4 mb-2">{title}</h4>
        {filteredItems.length === 0 ? (
          <p className="text-sm text-gray-500 mb-4">No {title.toLowerCase()} found.</p>
        ) : (
          <Table className="mb-4">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell className="flex items-center">
                    {getDocumentIcon(doc.file_name.split(".").pop()!)}
                    <span className="ml-2">{doc.file_name}</span>
                  </TableCell>
                  <TableCell>{doc.file_name.split(".").pop()}</TableCell>
                  <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(`${clientId}/${folder}/${doc.file_name}`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Doc
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Client Files</DialogTitle>
          <DialogDescription>Uploaded files for {clientName}</DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search files..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-5 w-5 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>

        <ScrollArea className="h-[350px]">
          {renderTable("Documents", documents, "documents")}
          {renderTable("Agreements", agreements, "agreements")}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
