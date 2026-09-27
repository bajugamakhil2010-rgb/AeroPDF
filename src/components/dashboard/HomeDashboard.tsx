import React, { useState } from 'react';
import {
  FileText,
  Search,
  UploadCloud,
  FolderOpen,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  HardDrive,
  Plus,
  Play,
  Layers,
  MoreVertical,
} from 'lucide-react';
import { PdfDocument, UserProfile } from '../../types';
import emptyDocsImg from '../../assets/images/empty_documents_art_1790497110250.jpg';

interface HomeDashboardProps {
  documents: PdfDocument[];
  user: UserProfile;
  onOpenDocument: (doc: PdfDocument) => void;
  onOpenImport: () => void;
  onLoadSamples: () => void;
  onViewAllLibrary: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenDocDetail: (doc: PdfDocument) => void;
  onOpenUpgrade: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  documents,
  user,
  onOpenDocument,
  onOpenImport,
  onLoadSamples,
  onViewAllLibrary,
  onToggleFavorite,
  onOpenDocDetail,
  onOpenUpgrade,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites' | 'downloads' | 'all'>('recent');

  const filteredDocs = documents.filter((doc) => {
    const matches = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matches) return false;
    if (activeTab === 'recent') return true;
    if (activeTab === 'favorites') return doc.isFavorite;
    if (activeTab === 'downloads') return doc.category === 'downloads';
    return true;
  });

  const recentDocs = [...documents].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt).slice(0, 6);
  const mostRecentDoc = recentDocs[0];

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-5 pb-24 space-y-6">
      {/* 1. HERO SEARCH & PRIMARY CTAS */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search PDF files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            onClick={onOpenImport}
            className="h-13 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Open PDF</span>
          </button>

          <button
            onClick={onOpenImport}
            className="h-13 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
          >
            <UploadCloud className="w-4 h-4 text-blue-400" />
            <span>Import PDF</span>
          </button>

          <button
            onClick={onLoadSamples}
            className="col-span-2 sm:col-span-1 h-13 px-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Sample PDFs</span>
          </button>
        </div>
      </div>

      {/* 2. LAST READ RESUME CARD */}
      {mostRecentDoc && !searchQuery && (
        <div
          onClick={() => onOpenDocument(mostRecentDoc)}
          className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-16 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700/60 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform">
                {mostRecentDoc.thumbnailUrl ? (
                  <img
                    src={mostRecentDoc.thumbnailUrl}
                    alt={mostRecentDoc.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-6 h-6 text-blue-400" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold tracking-wider">
                    RESUME READING
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatDate(mostRecentDoc.lastOpenedAt)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white truncate max-w-sm">
                  {mostRecentDoc.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Page {mostRecentDoc.lastReadPage} of {mostRecentDoc.totalPages}</span>
                  <span>·</span>
                  <span className="font-mono">{formatBytes(mostRecentDoc.fileSize)}</span>
                </div>
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30 transition-all">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${Math.max(
                  5,
                  Math.min(100, Math.round((mostRecentDoc.lastReadPage / mostRecentDoc.totalPages) * 100))
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 3. CATEGORY SEGMENTED TABS */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'favorites', label: 'Favorites', icon: Star },
              { id: 'downloads', label: 'Downloads', icon: FolderOpen },
              { id: 'all', label: 'All Docs', icon: Layers },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onViewAllLibrary}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
        >
          <span>View Library</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. DOCUMENTS LIST OR EMPTY STATE */}
      {filteredDocs.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center">
          <div className="w-48 h-36 rounded-2xl overflow-hidden mb-4 relative bg-slate-800/60 border border-slate-800">
            <img
              src={emptyDocsImg}
              alt="Empty Document Workspace"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
          </div>

          <h3 className="text-base font-bold text-white mb-1">No PDF documents here yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
            Import your PDF documents from internal storage, Downloads, or load sample business reports to test the reader engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
            <button
              onClick={onOpenImport}
              className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import from Device</span>
            </button>
            <button
              onClick={onLoadSamples}
              className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load 3 Sample PDFs</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredDocs.slice(0, 8).map((doc) => (
            <div
              key={doc.id}
              onClick={() => onOpenDocument(doc)}
              className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 flex items-center justify-between gap-3 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Thumbnail */}
                <div className="w-11 h-14 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700/60 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform">
                  {doc.thumbnailUrl ? (
                    <img src={doc.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-white truncate" title={doc.name}>
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span className="font-mono">{formatBytes(doc.fileSize)}</span>
                    <span>·</span>
                    <span>Page {doc.lastReadPage} of {doc.totalPages}</span>
                    <span>·</span>
                    <span>{formatDate(doc.lastOpenedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(doc.id);
                  }}
                  className="p-2 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                  title={doc.isFavorite ? 'Unfavorite' : 'Add to Favorites'}
                >
                  <Star
                    className={`w-4 h-4 ${doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDocDetail(doc);
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Document Info & Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. QUICK CLOUD VAULT SYNC STATUS BANNER */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">Local Encrypted Sandbox</p>
            <p className="text-[11px] text-slate-400">
              {documents.length} files saved · Zero-tracking storage
            </p>
          </div>
        </div>

        {user.plan === 'free' && (
          <button
            onClick={onOpenUpgrade}
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 shrink-0"
          >
            <span>Upgrade to Pro</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
