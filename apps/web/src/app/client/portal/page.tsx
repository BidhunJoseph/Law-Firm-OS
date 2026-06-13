"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  FileText, 
  UploadCloud, 
  X,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Info
} from "lucide-react";

const CASE_STATUS = {
  currentPhase: 3,
  phases: [
    { id: 1, title: 'Case Initiation', status: 'completed' },
    { id: 2, title: 'Discovery', status: 'completed' },
    { id: 3, title: 'Negotiation', status: 'active' },
    { id: 4, title: 'Trial Prep', status: 'pending' },
    { id: 5, title: 'Resolution', status: 'pending' }
  ]
};

const TIMELINE_EVENTS = [
  { id: 1, date: 'Jun 10, 2026', title: 'Opposing Counsel Responded', description: 'Received initial response to demand letter.' },
  { id: 2, date: 'Jun 05, 2026', title: 'Medical Records Received', description: 'All requested medical files have been logged.' },
  { id: 3, date: 'May 28, 2026', title: 'Demand Letter Sent', description: 'Formal demand sent to the defendant.' }
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

export default function ClientPortalPage() {
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
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | undefined => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Unsupported format. Use PDF, DOCX, JPG, or PNG.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
    }
    return undefined;
  };

  const processFiles = (newFiles: File[]) => {
    const newUploads = newFiles.map(file => {
      const error = validateFile(file);
      return {
        id: Math.random().toString(36).substring(7),
        file,
        progress: error ? 0 : 100,
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
      e.target.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-medium text-gray-800 tracking-tight">Client Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium border border-blue-200">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Case Overview Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-semibold text-gray-900">Smith v. Johnson</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active
                </span>
              </div>
              <p className="text-gray-500 text-sm">Personal Injury • Case #PI-2026-0492</p>
            </div>
            <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl border border-blue-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Next Step</p>
                <p className="text-blue-700/80">Awaiting your recent tax documents to proceed with settlement calculation.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Case Status & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Case Status Tracker */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-medium text-gray-900 mb-8">Case Progress</h3>
              
              {/* Desktop Tracker */}
              <div className="hidden sm:block relative px-4 pb-4">
                <div className="absolute top-4 left-4 right-4 h-1 bg-gray-100 rounded-full"></div>
                <div 
                  className="absolute top-4 left-4 h-1 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `calc(${((CASE_STATUS.currentPhase - 1) / (CASE_STATUS.phases.length - 1)) * 100}% - 1rem)` }}
                ></div>
                
                <div className="relative flex justify-between">
                  {CASE_STATUS.phases.map((phase) => {
                    const isCompleted = phase.status === 'completed';
                    const isActive = phase.status === 'active';
                    return (
                      <div key={phase.id} className="flex flex-col items-center relative z-10 w-24">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300 ${
                          isCompleted ? 'border-blue-500 bg-blue-50' : 
                          isActive ? 'border-blue-500 ring-4 ring-blue-50' : 
                          'border-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          ) : (
                            <span className={`text-sm font-semibold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{phase.id}</span>
                          )}
                        </div>
                        <span className={`mt-3 text-sm font-medium text-center leading-tight ${isActive ? 'text-blue-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                          {phase.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Tracker */}
              <div className="sm:hidden space-y-4">
                {CASE_STATUS.phases.map((phase, index) => {
                  const isCompleted = phase.status === 'completed';
                  const isActive = phase.status === 'active';
                  return (
                    <div key={phase.id} className="flex items-center gap-4">
                      <div className="relative flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white ${
                          isCompleted ? 'border-blue-500 bg-blue-50' : 
                          isActive ? 'border-blue-500 ring-4 ring-blue-50' : 
                          'border-gray-200'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                          ) : (
                            <span className={`text-sm font-semibold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{phase.id}</span>
                          )}
                        </div>
                        {index < CASE_STATUS.phases.length - 1 && (
                          <div className={`w-0.5 h-6 absolute top-8 ${isCompleted ? 'bg-blue-500' : 'bg-gray-100'}`} />
                        )}
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-blue-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                        {phase.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Stripped-down Timeline */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                Recent Updates
              </h3>
              <div className="space-y-6">
                {TIMELINE_EVENTS.map((event, idx) => (
                  <div key={event.id} className="flex gap-4 relative">
                    {idx !== TIMELINE_EVENTS.length - 1 && (
                      <div className="absolute top-8 left-[11px] bottom-[-24px] w-0.5 bg-gray-100" />
                    )}
                    <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5 z-10">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
                      <p className="text-xs text-gray-400 mt-1.5 font-medium">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column: Document Upload Zone */}
          <div className="lg:col-span-1 space-y-6">
            
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-gray-500" />
                Upload Documents
              </h3>
              
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center w-full p-8 text-center 
                  border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400'
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
                
                <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? 'bg-blue-100' : 'bg-white shadow-sm border border-gray-100'}`}>
                  <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Click or drag files to upload
                </p>
                <p className="text-xs text-gray-500">
                  PDF, Word, or Images up to 10MB
                </p>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ready to submit</h4>
                  <ul className="space-y-2">
                    {files.map((file) => (
                      <li key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className={`w-5 h-5 shrink-0 ${file.error ? 'text-red-400' : 'text-blue-500'}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {file.file.name}
                            </p>
                            {file.error ? (
                              <p className="text-xs text-red-500 truncate">{file.error}</p>
                            ) : (
                              <p className="text-xs text-gray-500">{(file.file.size / 1024 / 1024).toFixed(1)} MB</p>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-md transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  
                  <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm">
                    Submit Documents
                  </button>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Need Help?</h3>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-gray-600">SM</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sarah Mitchell</p>
                  <p className="text-xs text-gray-500">Paralegal</p>
                  <a href="#" className="text-sm text-blue-600 font-medium hover:underline mt-1 inline-block">Message Sarah</a>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
