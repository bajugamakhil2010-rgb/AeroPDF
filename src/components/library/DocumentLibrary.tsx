import React, { useState } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  ArrowUpDown,
  Star,
  FileText,
  MoreVertical,
  CheckSquare,
  Square,
  Trash2,
  Download,
  Filter,
  Layers,
  HardDrive,
  Calendar,
  X,
  Plus,
} from 'lucide-react';
import { PdfDocument } from '../../types';

interface DocumentLibraryProps {
  documents: PdfDocument[];
  onOpenDocument: (doc: PdfDocument) => void;
  onOpenDocDetail: (doc: PdfDocument) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onBatchFavorite: (ids: string[], isFav: boolean) => void;
  onOpenImport: () => void;
}

type SortField = 'lastOpenedAt' | 'name' | 'fileSize' | 'totalPages';
type SortOrder = 'asc' | 'desc';

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  onOpenDocument,
  onOpenDocDetail,
  onToggleFavorite,
  onDeleteDocument,
  onBatchDelete,
  onBatchFavorite,
  onOpenImport,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('lastOpenedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Multi-select state
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter & Sort
  const filteredDocs = documents
    .filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'favorites') return doc.isFavorite;
      return doc.category === selectedCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'fileSize') {
        comparison = a.fileSize - b.fileSize;
      } else if (sortField === 'totalPages') {
        comparison = a.totalPages - b.totalPages;
      } else {
        comparison = a.lastOpenedAt - b.lastOpenedAt;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDocs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDocs.map((d) => d.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    onBatchDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsMultiSelect(false);
  };

  const handleBatchFavorite = (fav: boolean) => {
    if (selectedIds.size === 0) return;
    onBatchFavorite(Array.from(selectedIds), fav);
    setSelectedIds(new Set());
    setIsMultiSelect(false);
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
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 pb-24 space-y-5">
      {/* Title & View Switcher */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            Document Library
          </h2>
          <p className="text-xs text-slate-400">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} in local vault
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-select toggle */}
          <button
            onClick={() => {
              setIsMultiSelect(!isMultiSelect);
              setSelectedIds(new Set());
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              isMultiSelect
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
            }`}
          >
            {isMultiSelect ? 'Done Selecting' : 'Select'}
          </button>

          {/* Grid vs List toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Select Action Bar */}
      {isMultiSelect && (
        <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3 animate-fade-in text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-semibold text-white"
            >
              {selectedIds.size === filteredDocs.length ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedIds.size} of {filteredDocs.length} selected
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchFavorite(true)}
              disabled={selectedIds.size === 0}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-200 flex items-center gap-1 transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Favorite</span>
            </button>

            <button
              onClick={handleBatchDelete}
              disabled={selectedIds.size === 0}
              className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 disabled:opacity-40 rounded-lg text-white font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="lastOpenedAt" className="bg-slate-900">Recent</option>
              <option value="name" className="bg-slate-900">Name</option>
              <option value="fileSize" className="bg-slate-900">Size</option>
              <option value="totalPages" className="bg-slate-900">Pages</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Documents' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'downloads', label: 'Downloads' },
          { id: 'work', label: 'Work' },
          { id: 'personal', label: 'Personal' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Document Content View */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No documents found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? `No files matching "${searchQuery}"`
              : 'Import your PDF documents to start reading and annotating.'}
          </p>
          <button
            onClick={onOpenImport}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Import PDF</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredDocs.map((doc) => {
            const isSelected = selectedIds.has(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => {
                  if (isMultiSelect) toggleSelectItem(doc.id);
                  else onOpenDocument(doc);
                }}
                className={`group relative rounded-2xl bg-slate-900/80 border p-3 flex flex-col transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Multi-select checkbox overlay */}
                {isMultiSelect && (
                  <div className="absolute top-2 left-2 z-10 p-1 bg-slate-900/80 backdrop-blur-sm rounded-lg">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}

                {/* Favorite Star Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(doc.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-slate-400 hover:text-amber-400"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      doc.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>

                {/* Thumbnail Preview Area */}
                <div className="w-full aspect-[3/4] rounded-xl bg-slate-800/80 overflow-hidden mb-2.5 flex items-center justify-center border border-slate-800 shadow-inner group-hover:scale-[1.02] transition-transform">
                  {doc.thumbnailUrl ? (
                    <img
                      src={doc.thumbnailUrl}
                      alt={doc.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-slate-600" />
                  )}
                </div>

                {/* Document details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate" title={doc.name}>
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                    <span>{formatBytes(doc.fileSize)}</span>
                    <span>·</span>
                    <span>{doc.totalPages}p</span>
                    <span>·</span>
                    <span>Pg {doc.lastReadPage}</span>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatDate(doc.lastOpenedAt)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDocDetail(doc);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded"
                    title="Document Options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const isSelected = selectedIds.has(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => {
                  if (isMultiSelect) toggleSelectItem(doc.id);
                  else onOpenDocument(doc);
                }}
                className={`p-3 rounded-2xl bg-slate-900/80 border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {isMultiSelect ? (
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  ) : null}

                  <div className="w-10 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700/60 flex items-center justify-center">
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
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono">{formatBytes(doc.fileSize)}</span>
                      <span>·</span>
                      <span>Page {doc.lastReadPage} of {doc.totalPages}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline">{formatDate(doc.lastOpenedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(doc.id);
                    }}
                    className="p-2 text-slate-400 hover:text-amber-400"
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
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
