import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  RotateCw,
  Sun,
  Moon,
  FileText,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfDocument } from '../../types';
import { loadPdf, renderPdfPage } from '../../services/pdfService';

interface PdfReaderProps {
  document: PdfDocument;
  onClose: () => void;
  onUpdateDocument?: (updated: PdfDocument) => void;
}

export const PdfReader: React.FC<PdfReaderProps> = ({
  document: initialDoc,
  onClose,
  onUpdateDocument,
}) => {
  const [doc, setDoc] = useState<PdfDocument>(initialDoc);
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialDoc.lastReadPage || 1);
  const [totalPages, setTotalPages] = useState<number>(initialDoc.totalPages || 1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load PDF Proxy
  useEffect(() => {
    let isMounted = true;

    async function initPdf() {
      if (doc.isImage) {
        setIsLoading(false);
        return;
      }

      if (!doc.fileData) {
        setErrorMessage('No document data found.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        const loaded = await loadPdf(doc.fileData);
        if (isMounted) {
          setPdfProxy(loaded);
          setTotalPages(loaded.numPages);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load PDF in reader:', err);
        if (isMounted) {
          setErrorMessage('Could not load PDF document. Please verify file integrity.');
          setIsLoading(false);
        }
      }
    }

    initPdf();
    return () => {
      isMounted = false;
    };
  }, [doc.id]);

  // Page update handler
  const handlePageChange = (newPage: number) => {
    const valid = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(valid);
    const updated = {
      ...doc,
      lastReadPage: valid,
      lastOpenedAt: Date.now(),
    };
    setDoc(updated);
    if (onUpdateDocument) {
      onUpdateDocument(updated);
    }
  };

  // Render canvas
  useEffect(() => {
    if (!pdfProxy || !canvasRef.current || doc.isImage) return;

    let isCancelled = false;

    async function render() {
      if (!canvasRef.current || !pdfProxy) return;
      try {
        await renderPdfPage(
          pdfProxy,
          currentPage,
          canvasRef.current,
          scale,
          rotation
        );
      } catch (err) {
        if (!isCancelled) {
          console.error('Error rendering page:', err);
        }
      }
    }

    render();
    return () => {
      isCancelled = true;
    };
  }, [pdfProxy, currentPage, scale, rotation]);

  // Fit to screen width
  const handleFitWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 32;
      // standard A4 width is ~595pt
      const estimatedScale = Math.max(0.6, Math.min(2.5, containerWidth / 595));
      setScale(parseFloat(estimatedScale.toFixed(2)));
    }
  };

  // Download copy
  const handleDownload = () => {
    if (doc.isImage && doc.imageUrl) {
      const a = window.document.createElement('a');
      a.href = doc.imageUrl;
      a.download = doc.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      return;
    }

    if (!doc.fileData) return;
    const blob = new Blob([doc.fileData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = doc.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none overflow-hidden font-sans"
    >
      {/* 1. TOP BAR (Pure Black & White Minimalist Header) */}
      <header className="h-14 bg-black border-b border-neutral-800 px-3 sm:px-4 flex items-center justify-between gap-2 z-20 shrink-0">
        {/* Left: Back button & Document Name */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white flex items-center gap-1.5 text-xs font-semibold active:scale-95 transition-all"
            title="Back to Uploads"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-md">
              {doc.name}
            </h3>
            <p className="text-[10px] text-neutral-400 font-mono">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>

        {/* Right Controls: Invert, Zoom, Rotate, Download */}
        <div className="flex items-center gap-1.5">
          {/* Invert Black & White reading mode */}
          <button
            onClick={() => setIsInverted(!isInverted)}
            className={`h-8 px-2 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors ${
              isInverted
                ? 'bg-white text-black border-white'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
            }`}
            title="Toggle Black / White Mode"
          >
            {isInverted ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isInverted ? 'White' : 'Invert'}</span>
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setScale((s) => Math.max(0.5, parseFloat((s - 0.2).toFixed(1))))}
            className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom % text */}
          <span className="text-[11px] font-mono text-neutral-400 min-w-[38px] text-center hidden sm:inline">
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom In */}
          <button
            onClick={() => setScale((s) => Math.min(3.0, parseFloat((s + 0.2).toFixed(1))))}
            className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Fit to width */}
          <button
            onClick={handleFitWidth}
            className="hidden sm:flex h-8 px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white items-center gap-1 text-xs"
            title="Fit to Width"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit</span>
          </button>

          {/* Rotate */}
          {!doc.isImage && (
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Download */}
          <button
            onClick={handleDownload}
            className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN DOCUMENT VIEWPORT (Pure High Contrast Canvas) */}
      <div className="flex-1 relative overflow-auto flex items-center justify-center p-3 sm:p-6 bg-neutral-950 touch-pan-x touch-pan-y">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono">Rendering document...</p>
          </div>
        ) : errorMessage ? (
          <div className="max-w-md p-6 text-center border border-neutral-800 rounded-2xl bg-black">
            <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Document Error</p>
            <p className="text-xs text-neutral-400 mb-4">{errorMessage}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-black font-bold text-xs rounded-lg hover:bg-neutral-200"
            >
              Back to Upload
            </button>
          </div>
        ) : doc.isImage && doc.imageUrl ? (
          /* Render Gallery Photo Image */
          <div
            className="shadow-2xl transition-all max-w-full"
            style={{
              filter: isInverted ? 'invert(1) hue-rotate(180deg)' : 'none',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={doc.imageUrl}
              alt={doc.name}
              className="max-h-[82vh] max-w-full object-contain rounded-sm border border-neutral-800 bg-white"
            />
          </div>
        ) : (
          /* Render PDF Canvas */
          <div
            className="relative shadow-2xl transition-all"
            style={{
              filter: isInverted
                ? 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(1.1)'
                : 'none',
            }}
          >
            <canvas ref={canvasRef} className="block bg-white rounded-sm shadow-2xl" />
          </div>
        )}
      </div>

      {/* 3. BOTTOM BAR (Clean Page Navigation) */}
      <footer className="h-14 bg-black border-t border-neutral-800 px-4 flex items-center justify-between z-20 pb-safe shrink-0">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || doc.isImage}
          className="h-9 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1.5 text-xs font-semibold active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Page indicator pill */}
        <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800 text-xs">
          <span className="text-neutral-400 font-mono">Page</span>
          <span className="font-bold text-white font-mono">{currentPage}</span>
          <span className="text-neutral-500 font-mono">/</span>
          <span className="font-mono text-neutral-400">{totalPages}</span>
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || doc.isImage}
          className="h-9 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1.5 text-xs font-semibold active:scale-95 transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
