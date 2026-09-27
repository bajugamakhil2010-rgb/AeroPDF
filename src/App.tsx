/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Image as ImageIcon,
  FolderOpen,
  ArrowRight,
  Trash2,
  Sparkles,
  ShieldAlert,
  HardDrive,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';
import { PdfDocument } from './types';
import {
  getAllDocuments,
  saveDocument,
  deleteDocument,
} from './services/storageService';
import { generateThumbnail, loadPdf } from './services/pdfService';
import { createSamplePdfDocument, generateSampleDocuments } from './services/samplePdfGenerator';
import { PdfReader } from './components/reader/PdfReader';
import { SinglePermissionDialog } from './components/modals/SinglePermissionDialog';
import { AndroidApkModal } from './components/modals/AndroidApkModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Smartphone } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<PdfDocument[]>([]);
  const [activeDocument, setActiveDocument] = useState<PdfDocument | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Hidden inputs for Files vs Gallery
  const filesInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check initial permission & load documents on mount
  useEffect(() => {
    let mounted = true;
    async function init() {
      const permissionStored = localStorage.getItem('aeropdf_storage_permission');
      if (permissionStored === 'granted') {
        if (mounted) setHasPermission(true);
      } else {
        // Ask for the one permission on opening the app
        if (mounted) setShowPermissionDialog(true);
      }

      const docs = await getAllDocuments();
      if (mounted) {
        setDocuments(docs);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle Permission decision
  const handleAllowPermission = () => {
    localStorage.setItem('aeropdf_storage_permission', 'granted');
    setHasPermission(true);
    setShowPermissionDialog(false);
    showToast('Storage access granted');
  };

  const handleDenyPermission = () => {
    localStorage.setItem('aeropdf_storage_permission', 'denied');
    setHasPermission(false);
    setShowPermissionDialog(false);
  };

  // Process a selected PDF file
  const processPdfFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus(`Opening ${file.name}...`);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Read total pages with PDF.js
      let totalPages = 1;
      try {
        const proxy = await loadPdf(arrayBuffer);
        totalPages = proxy.numPages;
      } catch (err) {
        console.warn('PDF parse info:', err);
      }

      // Generate cover thumbnail
      const thumbUrl = await generateThumbnail(arrayBuffer);

      const docRecord: PdfDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        fileSize: file.size,
        totalPages: totalPages,
        lastOpenedAt: Date.now(),
        createdAt: Date.now(),
        lastReadPage: 1,
        isFavorite: false,
        category: 'downloads',
        thumbnailUrl: thumbUrl,
        fileData: arrayBuffer,
        bookmarks: [],
        annotations: [],
      };

      await saveDocument(docRecord);
      const allDocs = await getAllDocuments();
      setDocuments(allDocs);

      // Immediately open the PDF so it is seen!
      setActiveDocument(docRecord);
      showToast('Document opened');
    } catch (err) {
      console.error('Error opening file:', err);
      showToast('Error opening file. Please select a valid PDF.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Process a gallery photo/image document
  const processImageFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus(`Loading photo ${file.name}...`);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const imageUrl = reader.result as string;

        const docRecord: PdfDocument = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          fileSize: file.size,
          totalPages: 1,
          lastOpenedAt: Date.now(),
          createdAt: Date.now(),
          lastReadPage: 1,
          isFavorite: false,
          category: 'personal',
          thumbnailUrl: imageUrl,
          isImage: true,
          imageUrl: imageUrl,
          bookmarks: [],
          annotations: [],
        };

        await saveDocument(docRecord);
        const allDocs = await getAllDocuments();
        setDocuments(allDocs);

        // Immediately open the photo document so it is seen!
        setActiveDocument(docRecord);
        showToast('Photo document opened');
        setIsProcessing(false);
        setProcessingStatus('');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error opening image:', err);
      setIsProcessing(false);
      showToast('Could not load image file');
    }
  };

  // Trigger Files Picker
  const handleOpenFilesPicker = () => {
    if (!hasPermission) {
      setShowPermissionDialog(true);
      return;
    }
    if (filesInputRef.current) {
      filesInputRef.current.value = '';
      filesInputRef.current.click();
    }
  };

  // Trigger Gallery Picker
  const handleOpenGalleryPicker = () => {
    if (!hasPermission) {
      setShowPermissionDialog(true);
      return;
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
  };

  // Input change handlers
  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else {
        processPdfFile(file);
      }
    }
  };

  const onGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else {
        processPdfFile(file);
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else {
        processPdfFile(file);
      }
    }
  };

  // Load verified sample PDF immediately
  const handleLoadSample = async () => {
    setIsProcessing(true);
    setProcessingStatus('Loading sample PDF...');
    try {
      const sampleConfigs = generateSampleDocuments();
      const first = sampleConfigs[0];
      const buffer = createSamplePdfDocument(first.name.replace('.pdf', ''), first.pages);
      const thumb = await generateThumbnail(buffer);

      const sampleDoc: PdfDocument = {
        id: `sample_${Date.now()}`,
        name: first.name,
        fileSize: buffer.byteLength,
        totalPages: first.pages.length,
        lastOpenedAt: Date.now(),
        createdAt: Date.now(),
        lastReadPage: 1,
        isFavorite: false,
        category: 'work',
        thumbnailUrl: thumb,
        fileData: buffer,
        bookmarks: [],
        annotations: [],
      };

      await saveDocument(sampleDoc);
      const allDocs = await getAllDocuments();
      setDocuments(allDocs);

      // Open immediately!
      setActiveDocument(sampleDoc);
      showToast('Sample PDF loaded');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate sample PDF');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDocument(id);
    const all = await getAllDocuments();
    setDocuments(all);
    if (activeDocument?.id === id) setActiveDocument(null);
    showToast('Removed from list');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Hidden File Pickers */}
      <input
        type="file"
        ref={filesInputRef}
        onChange={onFilesChange}
        accept="application/pdf,.pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        onChange={onGalleryChange}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Permission Request Dialog */}
      <SinglePermissionDialog
        isOpen={showPermissionDialog}
        onAllow={handleAllowPermission}
        onDeny={handleDenyPermission}
      />

      {/* TOP HEADER (Black & White) */}
      <header className="h-14 border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-xs font-mono">
            PDF
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            Aero<span className="text-neutral-400">PDF</span>
          </span>
        </div>

        {/* Android APK & Permission status pill */}
        <div className="flex items-center gap-2">
          {/* Android APK Button */}
          <button
            onClick={() => setShowApkModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-neutral-200 text-black text-[11px] font-bold shadow-sm transition-all active:scale-95"
            title="Download or install Android APK"
          >
            <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Android APK</span>
          </button>

          {hasPermission ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-medium">
              <Check className="w-3 h-3 text-white" />
              <span>Storage Allowed</span>
            </div>
          ) : (
            <button
              onClick={() => setShowPermissionDialog(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-[11px] text-neutral-200 font-medium hover:bg-neutral-800 transition-colors"
            >
              <ShieldAlert className="w-3 h-3 text-white" />
              <span>Enable Permission</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Permission warning banner if denied */}
        {!hasPermission && (
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-neutral-300">
              <ShieldAlert className="w-4 h-4 text-white shrink-0" />
              <span>Storage permission is required to access your files.</span>
            </div>
            <button
              onClick={() => setShowPermissionDialog(true)}
              className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-neutral-200 shrink-0"
            >
              Grant
            </button>
          </div>
        )}

        {/* PRIMARY UPLOAD ACTION CARDS (Black and White Theme) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
            Upload Document
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Files & Documents Button */}
            <button
              onClick={handleOpenFilesPicker}
              className="h-28 p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-800 hover:border-white flex flex-col justify-between text-left transition-all active:scale-[0.98] group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-md">
                <FolderOpen className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:underline">
                  Choose from Files
                </p>
                <p className="text-[11px] text-neutral-400">
                  Select PDF from device storage
                </p>
              </div>
            </button>

            {/* 2. Gallery / Photos Button */}
            <button
              onClick={handleOpenGalleryPicker}
              className="h-28 p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-800 hover:border-white flex flex-col justify-between text-left transition-all active:scale-[0.98] group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-md">
                <ImageIcon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:underline">
                  Choose from Gallery
                </p>
                <p className="text-[11px] text-neutral-400">
                  Photos, scans or images
                </p>
              </div>
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleOpenFilesPicker}
            className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-white bg-neutral-900'
                : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950'
            }`}
          >
            <Upload className="w-6 h-6 text-neutral-400 mb-2" />
            <p className="text-xs font-semibold text-white">
              Drag and drop your PDF here
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              or click to browse files
            </p>
          </div>

          {/* Quick 1-tap Sample PDF Loader */}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Need a test document?</span>
            <button
              onClick={handleLoadSample}
              className="text-xs font-bold text-white hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-neutral-300" />
              <span>Open Sample PDF</span>
            </button>
          </div>
        </div>

        {/* RECENT DOCUMENTS LIST */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
              Recent Documents ({documents.length})
            </h3>
            {documents.length > 0 && (
              <span className="text-[11px] text-neutral-500">Tap to open</span>
            )}
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-neutral-900 bg-neutral-950 text-neutral-500 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 text-neutral-700" />
              <p>No documents uploaded yet.</p>
              <p className="text-[11px] mt-0.5 text-neutral-600">
                Choose a PDF from Files or Gallery above to view.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocument(doc)}
                  className="p-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Thumbnail or Icon */}
                    <div className="w-10 h-12 rounded-lg bg-black border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {doc.thumbnailUrl ? (
                        <img
                          src={doc.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover:underline">
                        {doc.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {doc.isImage ? 'Photo' : `${doc.totalPages} pages`} ·{' '}
                        {formatBytes(doc.fileSize)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                      className="p-2 text-neutral-500 hover:text-white rounded-lg transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FULLSCREEN PDF READER (The PDF is seen immediately!) */}
      {activeDocument && (
        <PdfReader
          document={activeDocument}
          onClose={() => setActiveDocument(null)}
          onUpdateDocument={(updated) => {
            setDocuments((prev) =>
              prev.map((d) => (d.id === updated.id ? updated : d))
            );
          }}
        />
      )}

      {/* ANDROID APK & WEBAPK MODAL */}
      <AndroidApkModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />

      {/* PROCESSING MODAL */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-white mb-1">{processingStatus}</p>
            <p className="text-[11px] text-neutral-400">Rendering document pages...</p>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl shadow-2xl pointer-events-none animate-fade-in border border-neutral-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
