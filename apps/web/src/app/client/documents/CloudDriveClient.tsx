"use client";

import React, { useState, useRef } from "react";
import { 
  Cloud, FileText, Image as ImageIcon, File, UploadCloud, 
  MoreVertical, Download, Trash2, Search, Filter, Briefcase, Loader2, HardDrive 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { generateUploadUrl, registerDocumentMetadata, getSignedDownloadUrl, deleteDocument } from "@/server/actions/storage-actions";
import { useRouter } from "next/navigation";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
  if (mimeType.includes("image")) return <ImageIcon className="w-8 h-8 text-blue-500" />;
  if (mimeType.includes("word") || mimeType.includes("document")) return <FileText className="w-8 h-8 text-blue-700" />;
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return <FileText className="w-8 h-8 text-green-600" />;
  return <File className="w-8 h-8 text-gray-500" />;
}

export function CloudDriveClient({ documents, cases, quota }: any) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCase, setSelectedCase] = useState(cases.length > 0 ? cases[0].id : "");

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!selectedCase) {
      alert("Please select a matter before uploading.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // 1. Get secure path & verify quota
      const { filePath } = await generateUploadUrl(file.name, selectedCase, file.type, file.size);
      setUploadProgress(30);

      // 2. Upload directly to Supabase Storage
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;
      setUploadProgress(70);

      // 3. Register metadata in PostgreSQL
      await registerDocumentMetadata({
        fileName: file.name,
        filePath,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        caseId: selectedCase,
      });

      setUploadProgress(100);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (filePath: string) => {
    try {
      const url = await getSignedDownloadUrl(filePath);
      window.open(url, "_blank");
    } catch (err) {
      alert("Failed to generate secure link");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this file?")) return;
    try {
      await deleteDocument(id);
      router.refresh();
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  return (
    <div className="min-h-full bg-[#fbfcfd] p-4 md:p-8 lg:p-10 font-sans flex flex-col md:flex-row gap-8">
      
      {/* Main Drive Area */}
      <div className="flex-1 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
              <Cloud className="w-6 h-6 text-blue-600" /> Cloud Vault
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Secure, hyper-fast document storage powered by Supabase.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search vault..."
                className="pl-9 pr-4 py-2.5 text-sm w-64 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-all text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Upload Zone */}
        <div 
          onClick={handleUploadClick}
          className="relative bg-white border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all group overflow-hidden"
        >
          {isUploading && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300 ease-out" 
              style={{ width: `${uploadProgress}%` }} 
            />
          )}
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {isUploading ? <Loader2 className="w-8 h-8 text-blue-600 animate-spin" /> : <UploadCloud className="w-8 h-8 text-blue-600" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isUploading ? "Uploading to secure vault..." : "Drag & drop files or click to upload"}
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            Supported files: PDF, DOCX, XLSX, PNG, JPG. Max size 50MB per file.
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>

        {/* File Grid */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                The vault is empty. Upload a file to get started.
              </div>
            ) : documents.map((doc: any) => (
              <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="relative group/menu">
                    <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {/* Hover Menu */}
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 overflow-hidden">
                      <button onClick={() => handleDownload(doc.path)} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Download className="w-4 h-4" /> View/Draw
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 truncate" title={doc.name}>{doc.name}</h4>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span className="truncate flex-1">{doc.caseName}</span>
                  <span className="ml-2 font-medium">{formatBytes(doc.size)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Panel for Drive Info */}
      <div className="w-full md:w-80 shrink-0 space-y-6">
        
        {/* Upload Settings */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-400" /> Active Matter Context
          </h3>
          <p className="text-xs text-gray-500 mb-3">Any files uploaded will be securely attached to the selected matter.</p>
          <select 
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {cases.map((c: any) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Real-time Storage Quota */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-400" /> Storage Quota
          </h3>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">{formatBytes(quota.usedBytes)}</span>
            <span className="text-xs font-medium text-gray-500 mb-1">of {formatBytes(quota.totalBytes)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-1000 ${quota.percentage > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} 
              style={{ width: `${quota.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 flex justify-between">
            <span>Supabase Free Tier Limits</span>
            <span>{quota.percentage.toFixed(1)}% Used</span>
          </p>
        </div>

      </div>
    </div>
  );
}
