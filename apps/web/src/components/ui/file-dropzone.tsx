'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File as FileIcon, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function FileDropzone({ onUpload, accept, maxSizeMB = 50, className }: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    setError(null);
    setSuccess(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      await onUpload(selectedFile);
      setSuccess(true);
      setTimeout(() => {
        setSelectedFile(null);
        setSuccess(false);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative group flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
              isDragActive ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept={accept} 
              onChange={handleChange} 
            />
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            
            <motion.div 
              animate={{ y: isDragActive ? -5 : 0, scale: isDragActive ? 1.05 : 1 }}
              className="flex flex-col items-center justify-center text-slate-500 z-10"
            >
              <div className={cn(
                "p-4 rounded-full mb-3 transition-colors duration-300",
                isDragActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              )}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                <span className="text-royal-blue font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, DOCX, JPG, PNG (Max {maxSizeMB}MB)
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between z-10 relative">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <FileIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {!isUploading && !success && (
                <button onClick={removeFile} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center space-x-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>Upload successful!</p>
              </motion.div>
            )}

            <div className="mt-6 flex justify-end gap-3 z-10 relative">
              {!isUploading && !success && (
                <button 
                  onClick={removeFile}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={handleUploadClick}
                disabled={isUploading || success}
                className="relative overflow-hidden px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-slate-800 disabled:opacity-70 transition-all active:scale-95"
              >
                {isUploading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Uploading...
                  </span>
                ) : success ? (
                  "Uploaded"
                ) : (
                  "Upload File"
                )}
              </button>
            </div>
            
            {isUploading && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-emerald-500"
                initial={{ width: "0%" }}
                animate={{ width: "90%" }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            )}
            {success && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full"
                initial={{ width: "90%" }}
                animate={{ width: "100%" }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
