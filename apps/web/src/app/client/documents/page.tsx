"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  X,
  ArrowUpCircle,
  FileCheck2,
  AlertTriangle
} from "lucide-react";

type RequestStatus = 'requested' | 'uploaded' | 'under_review' | 'approved';

interface DocumentRequest {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  dueDate: string;
}

const MOCK_REQUESTS: DocumentRequest[] = [
  { id: '1', title: '2025 W-2 Form', description: 'Needed for tax preparation', status: 'requested', dueDate: '2026-06-20' },
  { id: '2', title: 'Passport Copy', description: 'Required for identity verification', status: 'uploaded', dueDate: '2026-06-15' },
  { id: '3', title: 'Bank Statements', description: 'Last 3 months of checking account', status: 'under_review', dueDate: '2026-06-10' },
  { id: '4', title: 'Driver\'s License', description: 'Front and back required', status: 'approved', dueDate: '2026-06-01' },
];

const ALLOWED_TYPES = [
  'application/pdf', 
  'image/jpeg', 
  'image/png', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
}

export default function DocumentPortalPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>(MOCK_REQUESTS);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we leave the current target
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | undefined => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Unsupported format. Use PDF, DOCX, JPG, or PNG.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
    }
    return undefined;
  };

  const processFiles = (newFiles: File[]) => {
    const newUploads = newFiles.map(file => {
      const error = validateFile(file);
      return {
        id: Math.random().toString(36).substring(7),
        file,
        progress: error ? 0 : 100, // mock instant upload for valid files
        error
      };
    });
    
    setFiles(prev => [...newUploads, ...prev]);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      // Reset input value to allow uploading the same file again if needed
      e.target.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case 'requested': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'uploaded': return <ArrowUpCircle className="w-5 h-5 text-blue-500" />;
      case 'under_review': return <Clock className="w-5 h-5 text-purple-500" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'requested': return <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full border border-amber-200">Requested</span>;
      case 'uploaded': return <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">Uploaded</span>;
      case 'under_review': return <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-200">Under Review</span>;
      case 'approved': return <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">Approved</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Document Portal</h1>
          <p className="text-gray-500 mt-2">Manage your requested documents and upload files securely.</p>
        </header>

        {/* Action Needed Section */}
        <section>
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-gray-600" />
            Document Requests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {requests.map(req => (
              <div 
                key={req.id} 
                className={`bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${req.status === 'requested' ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    {getStatusIcon(req.status)}
                    {getStatusBadge(req.status)}
                  </div>
                  <h3 className="font-semibold text-gray-900">{req.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{req.description}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Due: {new Date(req.dueDate).toLocaleDateString()}</span>
                  {req.status === 'requested' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }} 
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upload Zone */}
        <section>
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-gray-600" />
            Secure Upload
          </h2>
          
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative group flex flex-col items-center justify-center w-full p-12 text-center 
              border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400'
              }
            `}
          >
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept={ALLOWED_TYPES.join(',')}
            />
            
            <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
              <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
            </div>
            
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragging ? 'Drop files here' : 'Click or drag files here'}
            </p>
            <p className="text-sm text-gray-500 max-w-sm">
              Support for PDF, DOCX, JPG, and PNG files up to 10MB. 
              Files are encrypted and securely stored.
            </p>
          </div>
        </section>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-medium text-gray-900">Recent Uploads</h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full">{files.length}</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {files.map((file) => (
                <li key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg shrink-0 ${file.error ? 'bg-red-50' : 'bg-blue-50'}`}>
                      {file.error ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <FileText className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        {file.error ? (
                          <>
                            <span className="w-1 h-1 bg-red-500 rounded-full" />
                            <span className="text-xs text-red-600 font-medium truncate">{file.error}</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                            <span className="text-xs text-emerald-600 font-medium">Ready</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-4 shrink-0"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        
      </div>
    </div>
  );
}
