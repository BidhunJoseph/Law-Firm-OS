'use client';

import React, { useState, useRef, useTransition, useEffect } from 'react';
import { FileIcon, UploadCloud, Trash2, Eye, EyeOff, FileText, FileImage, Download, Loader2 } from 'lucide-react';
import { uploadDocument, deleteDocument, toggleDocumentVisibility, getSignedDownloadUrl } from '@/server/actions/document-actions';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function DocumentVaultTab({ matter }: { matter: any }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [localDocuments, setLocalDocuments] = useState<any[]>(matter.documents || []);
  useEffect(() => {
    setLocalDocuments(matter.documents || []);
  }, [matter.documents]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleUpload(files);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUpload(Array.from(e.target.files));
    }
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', matter.id);
      
      const res = await uploadDocument(formData);
      if (!res.success) {
        alert('Failed to upload ' + file.name + ': ' + res.error);
      } else if (res.document) {
        // Semi-optimistic update: add immediately so it appears before router.refresh finishes
        setLocalDocuments(prev => [{
          ...res.document,
          uploader: { full_name: 'You' }
        }, ...prev]);
      }
    }
    
    startTransition(() => {
      router.refresh();
    });
    setIsUploading(false);
  };

  const handleToggleVisibility = (docId: string, currentLevel: string) => {
    const isCurrentlyVisible = currentLevel === 'client_visible';
    startTransition(async () => {
      const res = await toggleDocumentVisibility(docId, !isCurrentlyVisible);
      if (!res.success) {
        alert('Failed to toggle visibility');
      } else {
        setLocalDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, confidentiality_level: !isCurrentlyVisible ? 'client_visible' : 'case_confidential' } : doc));
        router.refresh();
      }
    });
  };

  const handleDelete = (docId: string) => {
    if (!confirm('Are you sure you want to permanently delete this document?')) return;
    startTransition(async () => {
      const res = await deleteDocument(docId, matter.id);
      if (!res.success) {
        alert('Failed to delete document: ' + res.error);
      } else {
        setLocalDocuments(prev => prev.filter(doc => doc.id !== docId));
        router.refresh();
      }
    });
  };

  const handleDownload = async (storagePath: string) => {
    const res = await getSignedDownloadUrl(storagePath);
    if (res.success && res.url) {
      window.open(res.url, '_blank');
    } else {
      alert('Failed to get download link');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <FileIcon className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <div 
        className={`shrink-0 border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 mb-6 flex flex-col items-center justify-center cursor-pointer ${
          isDragging ? 'border-[#0066CC] bg-[#0066CC]/5 scale-[1.02]' : 'border-black/10 hover:border-[#0066CC]/50 hover:bg-black/5 bg-white'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileInput}
        />
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-[#0066CC]/10' : 'bg-black/5'}`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-[#0066CC] animate-spin" />
          ) : (
            <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-[#0066CC]' : 'text-[#86868B]'}`} />
          )}
        </div>
        <h4 className="text-[15px] font-semibold text-[#1D1D1F]">
          {isUploading ? 'Uploading securely...' : 'Drag & drop files here'}
        </h4>
        <p className="text-[13px] text-[#86868B] mt-1 font-medium">or click to browse</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-2xl border border-black/[0.04] shadow-sm">
        <div className="p-4 border-b border-black/[0.04] bg-[#FBFBFD] sticky top-0 z-10 flex justify-between items-center">
          <h3 className="text-[14px] font-semibold text-[#1D1D1F]">Stored Documents ({localDocuments.length})</h3>
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-[#86868B]" />}
        </div>
        
        {localDocuments.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileIcon className="w-6 h-6 text-[#86868B]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1D1D1F]">Vault is empty</p>
            <p className="text-[13px] text-[#86868B] mt-1">Upload files to organize them here.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {localDocuments.map((doc: any) => (
              <div key={doc.id} className="p-4 hover:bg-[#FBFBFD] transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-black/[0.03] flex items-center justify-center shrink-0">
                    {getFileIcon(doc.mime_type)}
                  </div>
                  <div className="flex flex-col min-w-0 pr-4">
                    <p className="text-[13px] font-semibold text-[#1D1D1F] truncate" title={doc.file_name}>{doc.file_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-[#86868B]">
                      <span>{formatFileSize(Number(doc.file_size_bytes || 0))}</span>
                      <span className="w-1 h-1 rounded-full bg-black/20"></span>
                      <span>{doc.uploader?.full_name || 'Unknown'}</span>
                      <span className="w-1 h-1 rounded-full bg-black/20"></span>
                      <span>{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleVisibility(doc.id, doc.confidentiality_level)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      doc.confidentiality_level === 'client_visible' 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                    title={doc.confidentiality_level === 'client_visible' ? "Visible to Client" : "Internal Only"}
                  >
                    {doc.confidentiality_level === 'client_visible' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {doc.confidentiality_level === 'client_visible' ? 'Client Visible' : 'Internal'}
                  </button>

                  <button 
                    onClick={() => handleDownload(doc.storage_path)}
                    className="p-1.5 hover:bg-black/5 rounded-md text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 hover:bg-red-50 rounded-md text-[#86868B] hover:text-red-600 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
