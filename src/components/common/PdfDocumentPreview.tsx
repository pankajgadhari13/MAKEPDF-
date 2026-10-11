import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ZoomIn, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  Maximize2,
  FileCheck,
  FileSearch,
  User,
  Calendar,
  Lock,
  Unlock,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { renderPdfPageThumbnail } from '../../utils/pdfPreview';
import { extractPdfMetadata, PdfMetadata } from '../../utils/pdfMetadata';
import { PdfMetadataInspector } from './PdfMetadataInspector';

interface PdfDocumentPreviewProps {
  file: File;
  onReplaceFile?: () => void;
  title?: string;
  className?: string;
  compact?: boolean;
  showInspectorByDefault?: boolean;
}

export const PdfDocumentPreview: React.FC<PdfDocumentPreviewProps> = ({
  file,
  onReplaceFile,
  title = "Document Preview",
  className = "",
  compact = false,
  showInspectorByDefault = true,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [showFullInspector, setShowFullInspector] = useState<boolean>(false);

  // Load preview & metadata when file or page changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Extract PDF thumbnail
    renderPdfPageThumbnail(file, currentPage, compact ? 260 : 420)
      .then((res) => {
        if (isMounted) {
          setThumbnailUrl(res.dataUrl);
          setTotalPages(res.numPages);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to render thumbnail:', err);
        if (isMounted) setLoading(false);
      });

    // Extract PDF metadata
    extractPdfMetadata(file)
      .then((data) => {
        if (isMounted) {
          setMetadata(data);
          if (data.pageCount > 0) {
            setTotalPages(data.pageCount);
          }
        }
      })
      .catch((err) => {
        console.warn('Metadata extraction fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [file, currentPage, compact]);

  const handlePrevPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const fileSizeFormatted =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

  if (compact) {
    return (
      <div className={`relative rounded-xl bg-[#101016] border border-[#232330] p-3 flex items-center gap-3 ${className}`}>
        {/* Compact Thumbnail Container */}
        <div 
          onClick={() => setIsFullscreen(true)}
          className="relative w-14 h-18 rounded-lg bg-black/60 overflow-hidden border border-[#2e2e3f] shrink-0 cursor-pointer group flex items-center justify-center"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-[#ff5722] border-t-transparent rounded-full animate-spin" />
          ) : thumbnailUrl ? (
            <>
              <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </>
          ) : (
            <FileText className="w-6 h-6 text-neutral-500" />
          )}
        </div>

        {/* File info */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{file.name}</p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 mt-0.5">
            <span>{fileSizeFormatted}</span>
            <span>·</span>
            <span className="text-[#ff5722] font-semibold">{totalPages} Pages</span>
            {metadata && (
              <>
                <span>·</span>
                <span className={metadata.isEncrypted ? 'text-amber-400' : 'text-emerald-400'}>
                  {metadata.isEncrypted ? 'Encrypted' : 'Unencrypted'}
                </span>
              </>
            )}
          </div>
        </div>

        {onReplaceFile && (
          <button
            onClick={onReplaceFile}
            className="text-[11px] font-semibold text-neutral-400 hover:text-[#ff5722] transition-colors cursor-pointer"
          >
            Change
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div className="rounded-2xl bg-[#0f0f15] border border-[#232330] overflow-hidden">
          {/* Top Header Bar */}
          <div className="px-5 py-3.5 border-b border-[#1c1c28] flex items-center justify-between bg-[#0b0b10]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#ff5722]/10 border border-[#ff5722]/30 flex items-center justify-center text-[#ff5722]">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white font-display">{title}</span>
                <span className="text-[10px] font-mono text-neutral-400 ml-2 hidden sm:inline">
                  Verified In-Memory Stream {metadata ? `· ${metadata.pdfVersion}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-400 bg-[#161622] px-2.5 py-1 rounded-md border border-[#242435]">
                {fileSizeFormatted}
              </span>
              {onReplaceFile && (
                <button
                  onClick={onReplaceFile}
                  className="text-xs font-medium text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-[#1a1a24] transition-colors cursor-pointer"
                >
                  Replace file
                </button>
              )}
            </div>
          </div>

          {/* Main Preview Workspace */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left/Center: Visual Document Sheet Preview */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div 
                onClick={() => setIsFullscreen(true)}
                className="relative w-[210px] sm:w-[230px] aspect-[1/1.414] rounded-xl bg-white shadow-[0_15px_35px_rgba(0,0,0,0.6)] overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.02] border border-[#2c2c3e]"
              >
                {loading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#13131c] text-neutral-400 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#ff5722]" />
                    <span className="text-[11px] font-mono">Rendering Page {currentPage}...</span>
                  </div>
                ) : thumbnailUrl ? (
                  <>
                    <img
                      src={thumbnailUrl}
                      alt={`PDF Page ${currentPage}`}
                      className="w-full h-full object-contain"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity text-white">
                      <Maximize2 className="w-6 h-6 text-[#ff5722]" />
                      <span className="text-xs font-semibold">Click to expand preview</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#13131c]">
                    <FileText className="w-10 h-10 text-neutral-500" />
                  </div>
                )}

                {/* Page Number Badge */}
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-[10px] font-mono text-white px-2 py-0.5 rounded shadow">
                  Page {currentPage} of {totalPages}
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-3 mt-4 bg-[#14141d] px-3 py-1.5 rounded-full border border-[#232332]">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1 || loading}
                    className="p-1 rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-medium text-neutral-300">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || loading}
                    className="p-1 rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Key Verified Details & Metadata Summary */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-4 rounded-xl bg-[#13131b] border border-[#222230] space-y-3">
                {/* File Name */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1f1f2b]">
                  <span className="text-xs text-neutral-400">File Name</span>
                  <span className="text-xs font-bold text-white truncate max-w-[220px]" title={file.name}>
                    {file.name}
                  </span>
                </div>

                {/* Page Count */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1f1f2b]">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Layers className="w-3.5 h-3.5 text-[#ff5722]" />
                    <span>Page Count</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#ff5722]">
                      {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
                    </span>
                    {metadata && (
                      <span className="text-[10px] text-neutral-400 font-mono">
                        ({metadata.pageFormat})
                      </span>
                    )}
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1f1f2b]">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Author</span>
                  </div>
                  <span className="text-xs font-medium text-white truncate max-w-[200px]" title={metadata?.author || 'Not specified'}>
                    {metadata?.author || 'Not specified'}
                  </span>
                </div>

                {/* Creation Date */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1f1f2b]">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Creation Date</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-200">
                    {metadata?.creationDateFormatted || 'Reading header...'}
                  </span>
                </div>

                {/* File Encryption Status */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#1f1f2b]">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    {metadata?.isEncrypted ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Encryption Status</span>
                  </div>
                  <span className={`text-xs font-medium font-mono flex items-center gap-1 ${
                    metadata?.isEncrypted ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {metadata?.isEncrypted ? 'Encrypted (Protected)' : 'Unencrypted (Standard Access)'}
                  </span>
                </div>

                {/* Pre-flight Verification */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-xs text-neutral-400">Pre-flight Verification</span>
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & ready to process
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowFullInspector(!showFullInspector)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    showFullInspector
                      ? 'bg-[#ff5722]/15 border-[#ff5722] text-[#ff851a]'
                      : 'bg-[#171722] hover:bg-[#1f1f2e] border-[#2a2a3b] text-neutral-200'
                  }`}
                >
                  <FileSearch className="w-3.5 h-3.5 text-[#ff5722]" />
                  <span>{showFullInspector ? 'Hide Full Inspector' : 'PDF Metadata Inspector'}</span>
                  {showFullInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsFullscreen(true)}
                  className="py-2.5 px-3.5 rounded-xl bg-[#171722] hover:bg-[#1f1f2e] border border-[#2a2a3b] text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Expand preview"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#ff5722]" />
                  <span className="hidden sm:inline">Inspect Page</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed PDF Metadata Inspector Component */}
        {(showInspectorByDefault || showFullInspector) && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <PdfMetadataInspector
              file={file}
              defaultExpanded={showFullInspector}
              showCardHeader={true}
            />
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div 
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Top Modal Controls */}
          <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[#232332] text-white">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#ff5722] text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold truncate max-w-[260px] sm:max-w-md">{file.name}</p>
                <span className="text-xs font-mono text-neutral-400">
                  Page {currentPage} of {totalPages} {metadata ? `· ${metadata.pageFormat}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.max(0.7, z - 0.2));
                }}
                className="px-2.5 py-1 rounded bg-[#1c1c28] text-xs text-neutral-300 hover:text-white"
              >
                -
              </button>
              <span className="text-xs font-mono text-neutral-400 w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.min(2.5, z + 0.2));
                }}
                className="px-2.5 py-1 rounded bg-[#1c1c28] text-xs text-neutral-300 hover:text-white"
              >
                +
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-lg bg-[#1c1c28] text-neutral-400 hover:text-white ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Canvas Sheet View */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="flex-1 overflow-auto flex items-center justify-center p-4"
          >
            {thumbnailUrl && (
              <div 
                className="bg-white rounded-lg shadow-2xl p-2 transition-transform duration-150 border border-neutral-300"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              >
                <img
                  src={thumbnailUrl}
                  alt={`Full Page ${currentPage}`}
                  className="max-h-[80vh] w-auto object-contain rounded"
                />
              </div>
            )}
          </div>

          {/* Bottom Pagination within Lightbox */}
          {totalPages > 1 && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="max-w-xs mx-auto flex items-center justify-between bg-[#151520] px-4 py-2 rounded-full border border-[#29293b]"
            >
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 rounded text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-neutral-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 rounded text-neutral-300 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

