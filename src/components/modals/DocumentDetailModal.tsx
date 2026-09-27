import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  Layers,
  HardDrive,
  Edit2,
  Trash2,
  Download,
  Star,
  Check,
  Bookmark,
  Highlighter,
} from 'lucide-react';
import { PdfDocument } from '../../types';

interface DocumentDetailModalProps {
  document: PdfDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (doc: PdfDocument) => void;
  onOpenInReader: (doc: PdfDocument) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  isOpen,
  onClose,
  onRename,
  onDelete,
  onToggleFavorite,
  onDownload,
  onOpenInReader,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !document) return null;

  const handleStartRename = () => {
    setEditedName(document.name);
    setIsEditingName(true);
  };

  const handleSaveRename = () => {
    if (editedName.trim()) {
      let finalName = editedName.trim();
      if (!finalName.toLowerCase().endsWith('.pdf')) {
        finalName += '.pdf';
      }
      onRename(document.id, finalName);
    }
    setIsEditingName(false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Document Info
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail & Title Area */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className="w-16 h-20 bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 flex items-center justify-center shadow-inner">
            {document.thumbnailUrl ? (
              <img
                src={document.thumbnailUrl}
                alt={document.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FileText className="w-8 h-8 text-blue-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-slate-800 border border-blue-500 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-1">
                <h3 className="text-base font-semibold text-white break-words line-clamp-2">
                  {document.name}
                </h3>
                <button
                  onClick={handleStartRename}
                  className="p-1 text-slate-400 hover:text-blue-400 shrink-0 mt-0.5"
                  title="Rename Document"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => onToggleFavorite(document.id)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  document.isFavorite
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Star
                  className={`w-3 h-3 ${document.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                />
                <span>{document.isFavorite ? 'Favorited' : 'Add Favorite'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <HardDrive className="w-3.5 h-3.5" />
              <span>File Size</span>
            </div>
            <p className="font-semibold text-slate-200 font-mono">
              {formatBytes(document.fileSize)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Pages & Progress</span>
            </div>
            <p className="font-semibold text-slate-200 font-mono">
              Page {document.lastReadPage} of {document.totalPages}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks</span>
            </div>
            <p className="font-semibold text-slate-200 font-mono">
              {document.bookmarks.length} saved
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Highlighter className="w-3.5 h-3.5" />
              <span>Annotations</span>
            </div>
            <p className="font-semibold text-slate-200 font-mono">
              {document.annotations.length} items
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800 text-[11px] text-slate-400 space-y-1 mb-6">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Last Opened
            </span>
            <span className="font-mono text-slate-300">{formatDate(document.lastOpenedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Added Date
            </span>
            <span className="font-mono text-slate-300">{formatDate(document.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenInReader(document);
            }}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 active:scale-[0.99] transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Open in Reader (Page {document.lastReadPage})</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDownload(document)}
              className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Copy</span>
            </button>

            {confirmDelete ? (
              <button
                onClick={() => {
                  onDelete(document.id);
                  onClose();
                }}
                className="h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Confirm Delete?</span>
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="h-10 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
