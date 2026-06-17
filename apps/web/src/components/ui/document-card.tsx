'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, CheckCircle, ShieldAlert, Image as ImageIcon, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteDocument, getSignedDownloadUrl } from '@/server/actions/document-actions';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCardProps {
  document: {
    id: string;
    case_id: string;
    file_name: string;
    mime_type: string | null;
    file_size_bytes: string | number | null; // BigInt serialized as string or number
    document_type: string | null;
    review_status: string | null;
    confidentiality_level: string | null;
    created_at: Date | string;
    storage_path: string;
  };
  onDelete?: () => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const formatBytes = (bytes: string | number | null) => {
    if (!bytes) return '0 B';
    const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (b < 1024) return b + ' B';
    else if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    else return (b / 1048576).toFixed(1) + ' MB';
  };

  const getIcon = (mime: string | null) => {
    if (!mime) return <FileText className="w-8 h-8 text-royal-blue" />;
    if (mime.includes('image')) return <ImageIcon className="w-8 h-8 text-amber-500" />;
    if (mime.includes('pdf')) return <FileText className="w-8 h-8 text-rose-500" />;
    if (mime.includes('word') || mime.includes('document')) return <FileText className="w-8 h-8 text-blue-500" />;
    return <FileCode className="w-8 h-8 text-slate-500" />;
  };

  const handleDownload = async () => {
    const res = await getSignedDownloadUrl(document.storage_path);
    if (res.success && res.url) {
      window.open(res.url, '_blank');
    } else {
      alert(res.error || 'Failed to download file');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    setIsDeleting(true);
    const res = await deleteDocument(document.id, document.case_id);
    if (res.success) {
      onDelete?.();
    } else {
      alert(res.error || 'Failed to delete file');
      setIsDeleting(false);
    }
  };

  const isConfidential = document.confidentiality_level === 'highly_confidential';
  const isReviewed = document.review_status === 'approved';

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}
      className="group relative bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-sm flex flex-col justify-between overflow-hidden transition-all duration-300"
    >
      <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={handleDownload} className="p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-royal-blue rounded-full shadow-sm transition-colors">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={handleDelete} disabled={isDeleting} className="p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-rose-500 rounded-full shadow-sm transition-colors disabled:opacity-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start space-x-4 z-0 relative">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 shrink-0">
          {getIcon(document.mime_type)}
        </div>
        <div className="min-w-0 pr-12">
          <h4 className="font-semibold text-slate-900 truncate text-sm" title={document.file_name}>
            {document.file_name}
          </h4>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs text-slate-500 font-medium">
              {formatBytes(document.file_size_bytes)}
            </p>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <p className="text-xs text-slate-500 truncate uppercase">
              {document.document_type || 'General'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="text-slate-400 font-medium">
          Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
        </div>
        <div className="flex space-x-2">
          {isConfidential && (
            <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-md" title="Highly Confidential">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              <span>Restricted</span>
            </div>
          )}
          {isReviewed ? (
            <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              <span>Approved</span>
            </div>
          ) : (
            <div className="flex items-center text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              <span className="w-2 h-2 bg-amber-400 rounded-full mr-1.5 animate-pulse" />
              <span>Reviewing</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
    </motion.div>
  );
}
