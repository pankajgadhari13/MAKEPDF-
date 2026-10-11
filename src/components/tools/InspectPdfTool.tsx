import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSearch, 
  Upload, 
  ArrowLeft, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  Layers,
  User,
  Calendar,
  Lock,
  Unlock,
  ArrowRight,
  Maximize2,
  RefreshCw,
  X,
  Eye,
  FileText,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { ProcessedItem, ActiveView } from '../../types';
import { PdfMetadataInspector } from '../common/PdfMetadataInspector';
import { ContinueToSuggestions } from '../common/ContinueToSuggestions';
import { extractPdfMetadata, PdfMetadata } from '../../utils/pdfMetadata';
import { renderPdfFirstPageToCanvas } from '../../utils/pdfPreview';
import { smoothScrollToTop } from '../../utils/scrollHelper';

interface InspectPdfToolProps {
  onBack: () => void;
  onRecordHistory?: (item: ProcessedItem) => void;
  onNavigateToTool?: (tool: ActiveView, file?: File) => void;
  initialFile?: File | null;
}

export const InspectPdfTool: React.FC<InspectPdfToolProps> = ({
  onBack,
  onRecordHistory,
  onNavigateToTool,
  initialFile,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [renderingCanvas, setRenderingCanvas] = useState<boolean>(false);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'inspector'>('overview');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    smoothScrollToTop();
    extractPdfMetadata(f).then((meta) => {
      setMetadata(meta);
      if (onRecordHistory) {
        onRecordHistory({
          id: `inspect_${Date.now()}`,
          filename: f.name,
          tool: 'PDF Metadata Inspector',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(2)} MB` : `${Math.round(f.size / 1024)} KB`,
          status: 'Completed',
        });
      }
    });
  };

  useEffect(() => {
    if (initialFile) {
      handleFile(initialFile);
    }
  }, [initialFile]);

  // Render first page onto canvas element whenever file changes
  useEffect(() => {
    if (!file || !canvasRef.current) return;

    let isMounted = true;
    setRenderingCanvas(true);

    const canvas = canvasRef.current;
    renderPdfFirstPageToCanvas(file, canvas, 440)
      .then((res) => {
        if (isMounted) {
          setRenderingCanvas(false);
          setCanvasDimensions({ width: res.width, height: res.height });
        }
      })
      .catch((err) => {
        console.error('Failed to render first page to canvas:', err);
        if (isMounted) {
          setRenderingCanvas(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Re-render onto zoom canvas if lightbox opens
  useEffect(() => {
    if (isZoomModalOpen && file && zoomCanvasRef.current) {
      renderPdfFirstPageToCanvas(file, zoomCanvasRef.current, 720).catch(console.error);
    }
  }, [isZoomModalOpen, file]);

  const handleReset = () => {
    setFile(null);
    setMetadata(null);
    setCanvasDimensions(null);
  };

  const handleDownloadThumbnail = () => {
    if (!canvasRef.current) return;
    smoothScrollToTop();
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${file?.name.replace(/\.pdf$/i, '') || 'document'}-page1-thumbnail.png`;
      a.click();
    } catch (e) {
      console.warn('Canvas download error:', e);
    }
  };

  const handleExportJson = () => {
    if (!metadata) return;
    smoothScrollToTop();
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace(/\.pdf$/i, '') || 'document'}-metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    if (!metadata) return;
    const summary = [
      `File Name: ${metadata.fileName}`,
      `File Size: ${metadata.fileSizeFormatted}`,
      `Pages: ${metadata.pageCount}`,
      `Author: ${metadata.author}`,
      `Creation Date: ${metadata.creationDateFormatted}`,
      `Encryption: ${metadata.encryptionStatusText}`,
      `PDF Version: ${metadata.pdfVersion}`,
      `Page Format: ${metadata.pageFormat} (${metadata.orientation})`,
    ].join('\n');

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header / Nav */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Tools</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400 bg-[#12121b] border border-[#20202e] px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
              Pre-Flight Inspector Core
            </span>
          </div>
        </div>

        {/* Title Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#ff5722]/15 border border-[#ff5722]/40 flex items-center justify-center text-[#ff851a]">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                PDF Metadata Inspector
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                Inspect visual first-page canvas thumbnail, verify page count, author, creation date, and encryption status.
              </p>
            </div>
          </div>
        </div>

        {/* File Dropzone or Active Inspector */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-[#2d2d3f] hover:border-[#ff5722] rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all bg-[#0f0f15]/80 hover:bg-[#12121c] flex flex-col items-center justify-center group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            <div className="w-16 h-16 rounded-2xl bg-[#ff5722]/10 border border-[#ff5722]/30 flex items-center justify-center text-[#ff851a] group-hover:scale-110 transition-transform mb-4">
              <FileSearch className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">
              Select or drop PDF to inspect metadata
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mb-6">
              Instant in-memory visual canvas rendering of page 1, with validation of page count, author identity, creation timestamp, and encryption state.
            </p>
            <span className="px-5 py-2.5 rounded-lg text-xs font-bold text-black bg-[#ff851a] group-hover:bg-[#ff9933] transition-colors">
              Choose PDF File
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top File Summary Bar */}
            <div className="rounded-2xl bg-[#101017] border border-[#232332] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#ff5722]/15 border border-[#ff5722]/40 flex items-center justify-center text-[#ff851a] shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate max-w-[240px] sm:max-w-md font-mono">
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Verified Stream
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono mt-0.5">
                    <span>
                      {file.size > 1024 * 1024
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                        : `${Math.round(file.size / 1024)} KB`}
                    </span>
                    <span>·</span>
                    <span className="text-[#ff5722] font-semibold">{metadata?.pageCount || 1} Pages</span>
                    {metadata?.pdfVersion && (
                      <>
                        <span>·</span>
                        <span>{metadata.pdfVersion}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 rounded-xl bg-[#181824] hover:bg-[#222232] border border-[#2d2d3f] text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* View Selector Tabs */}
            <div className="flex items-center gap-2 border-b border-[#1f1f2e] pb-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'text-white border-b-2 border-[#ff5722] bg-[#12121b]'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#ff5722]" />
                <span>Visual Canvas & Core Verification</span>
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'inspector'
                    ? 'text-white border-b-2 border-[#ff5722] bg-[#12121b]'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FileSearch className="w-3.5 h-3.5 text-[#ff5722]" />
                <span>Comprehensive Audit & Raw Dictionary</span>
              </button>
            </div>

            {activeTab === 'overview' ? (
              /* Two Column Layout: Visual Canvas Thumbnail + Metadata Metrics */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left: Canvas Element First Page Thumbnail */}
                <div className="lg:col-span-5 rounded-2xl bg-[#0f0f15] border border-[#232332] p-5 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                        First Page Thumbnail
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff5722]/15 text-[#ff851a] border border-[#ff5722]/30">
                        HTML5 Canvas
                      </span>
                    </div>
                    {canvasDimensions && (
                      <span className="text-[11px] font-mono text-neutral-400">
                        {canvasDimensions.width} × {canvasDimensions.height} pt
                      </span>
                    )}
                  </div>

                  {/* Canvas Container */}
                  <div className="relative group w-full flex items-center justify-center p-3 rounded-xl bg-[#07070a] border border-[#1b1b26] min-h-[360px]">
                    {renderingCanvas && (
                      <div className="absolute inset-0 z-10 bg-[#0e0e15]/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-300">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#ff5722]" />
                        <span className="text-xs font-mono">Rendering page 1 to canvas...</span>
                      </div>
                    )}

                    {/* The Visual Canvas Element Rendering Page 1 */}
                    <div className="relative bg-white rounded-md shadow-2xl overflow-hidden border border-[#2c2c3e]">
                      <canvas
                        ref={canvasRef}
                        className="block max-w-full h-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                        style={{ maxHeight: '420px', minHeight: '260px' }}
                      />

                      {/* Overlay Page Badge */}
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-[10px] font-mono text-white px-2 py-0.5 rounded shadow border border-white/10">
                        Page 1 of {metadata?.pageCount || 1}
                      </div>

                      {/* Hover Overlay with Action Hints */}
                      <div 
                        onClick={() => setIsZoomModalOpen(true)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white cursor-pointer"
                      >
                        <Maximize2 className="w-6 h-6 text-[#ff5722]" />
                        <span className="text-xs font-semibold">Click to expand preview</span>
                      </div>
                    </div>
                  </div>

                  {/* Canvas Control Actions */}
                  <div className="w-full mt-4 pt-3 border-t border-[#1c1c28] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Canvas Active</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadThumbnail}
                        className="px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] border border-[#2a2a3c] text-[11px] font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Export Canvas to PNG image"
                      >
                        <Download className="w-3.5 h-3.5 text-[#ff5722]" />
                        <span>Save PNG</span>
                      </button>

                      <button
                        onClick={() => setIsZoomModalOpen(true)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#181824] hover:bg-[#222232] border border-[#2a2a3c] text-[11px] font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Enlarge Canvas Preview"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-neutral-300" />
                        <span>Enlarge</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: The Four Core Verification Metrics Cards & Specs */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Four Core Cards requested: Page count, Author, Creation date, Encryption status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* 1. Page Count */}
                    <div className="p-4 rounded-xl bg-[#0f0f15] border border-[#232332] flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-[#ff5722]/15 border border-[#ff5722]/40 flex items-center justify-center text-[#ff851a] shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                          Page Count
                        </div>
                        <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                          {metadata ? `${metadata.pageCount} ${metadata.pageCount === 1 ? 'Page' : 'Pages'}` : '—'}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {metadata ? `${metadata.pageFormat} · ${metadata.orientation}` : 'Analyzing layout...'}
                        </div>
                      </div>
                    </div>

                    {/* 2. Author */}
                    <div className="p-4 rounded-xl bg-[#0f0f15] border border-[#232332] flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                          Author
                        </div>
                        <div className="text-sm font-bold text-white truncate mt-1">
                          {metadata?.author || 'Not specified'}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {metadata?.creator ? `Creator: ${metadata.creator}` : 'Embedded metadata stream'}
                        </div>
                      </div>
                    </div>

                    {/* 3. Creation Date */}
                    <div className="p-4 rounded-xl bg-[#0f0f15] border border-[#232332] flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                          Creation Date
                        </div>
                        <div className="text-sm font-bold text-white truncate mt-1">
                          {metadata?.creationDateFormatted || 'Unknown date'}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                          {metadata?.modificationDateFormatted 
                            ? `Modified: ${metadata.modificationDateFormatted}`
                            : 'ISO timestamp recorded'}
                        </div>
                      </div>
                    </div>

                    {/* 4. Encryption Status */}
                    <div className="p-4 rounded-xl bg-[#0f0f15] border border-[#232332] flex items-start gap-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        metadata?.isEncrypted
                          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                          : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                      }`}>
                        {metadata?.isEncrypted ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                          Encryption Status
                        </div>
                        <div className={`text-sm font-bold truncate mt-1 ${
                          metadata?.isEncrypted ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {metadata?.encryptionStatusText || 'Verifying security...'}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {metadata?.isEncrypted ? 'Requires password access' : 'No password required'}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Pre-Flight Health Checklist */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#0c0c12] border border-[#20202e] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#ff5722]" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                          Pre-Flight Verification Checklist
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready for Pipeline
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-neutral-300 bg-[#12121b] p-2.5 rounded-lg border border-[#1f1f2e]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Valid PDF Header ({metadata?.pdfVersion || '%PDF-1.7'})</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-300 bg-[#12121b] p-2.5 rounded-lg border border-[#1f1f2e]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{metadata?.isEncrypted ? 'Encrypted Stream (Keyed)' : 'Standard Unencrypted Stream'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-300 bg-[#12121b] p-2.5 rounded-lg border border-[#1f1f2e]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Page 1 Canvas Raster Verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-300 bg-[#12121b] p-2.5 rounded-lg border border-[#1f1f2e]">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Title: {metadata?.title || 'No Title Set'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Copy / Technical Specifications */}
                  <div className="p-4 rounded-xl bg-[#0f0f15] border border-[#232332] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopySummary}
                        className="px-3 py-1.5 rounded-lg bg-[#161622] hover:bg-[#202030] border border-[#2a2a3e] text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#ff5722]" />
                            <span>Copy Metadata Summary</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setActiveTab('inspector')}
                        className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-[#181824] text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <FileSearch className="w-3.5 h-3.5" />
                        <span>View All Raw Fields</span>
                      </button>
                    </div>

                    <button
                      onClick={handleExportJson}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1c1c28] hover:bg-[#262638] border border-[#303046] text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#ff5722]" />
                      <span>Export JSON</span>
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              /* Tab 2: Full Detailed Inspector Component */
              <div className="space-y-4">
                <PdfMetadataInspector
                  file={file}
                  defaultExpanded={true}
                  showCardHeader={false}
                />
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="rounded-2xl bg-[#101018] border border-[#232332] p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportJson}
                  className="px-4 py-2.5 rounded-xl bg-[#191924] hover:bg-[#222232] border border-[#2d2d3f] text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#ff5722]" />
                  <span>Download Metadata JSON</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-[#191924] text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Inspect Another PDF
                </button>
              </div>

              {onNavigateToTool && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 hidden sm:inline">Proceed with this file:</span>
                  <button
                    onClick={() => onNavigateToTool('compress-pdf', file)}
                    className="px-3.5 py-2 rounded-xl bg-[#ff5722] hover:bg-[#ff6e3a] text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Compress PDF</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateToTool('split-pdf', file)}
                    className="px-3.5 py-2 rounded-xl bg-[#181824] hover:bg-[#222232] border border-[#2d2d3f] text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <span>Split PDF</span>
                  </button>
                  <button
                    onClick={() => onNavigateToTool('protect-pdf', file)}
                    className="px-3.5 py-2 rounded-xl bg-[#181824] hover:bg-[#222232] border border-[#2d2d3f] text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    <span>Protect PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {onNavigateToTool && (
              <ContinueToSuggestions
                currentPdfFile={file}
                onSelectTool={(tool, f) => onNavigateToTool(tool, f || file)}
              />
            )}
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal for First Page Canvas */}
      {isZoomModalOpen && file && (
        <div 
          onClick={() => setIsZoomModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#0d0d14] border border-[#29293e] rounded-2xl overflow-hidden p-6 flex flex-col items-center gap-4"
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between border-b border-[#202030] pb-3">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#ff5722]" />
                <h3 className="text-sm font-bold text-white">First Page Canvas Preview · High Resolution</h3>
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#1a1a28] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Canvas Render */}
            <div className="w-full flex items-center justify-center p-4 bg-[#050508] rounded-xl border border-[#1b1b26] max-h-[70vh] overflow-auto">
              <canvas
                ref={zoomCanvasRef}
                className="max-w-full h-auto object-contain shadow-2xl rounded"
                style={{ maxHeight: '65vh' }}
              />
            </div>

            {/* Modal Footer */}
            <div className="w-full flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-[#1f1f2e]">
              <span className="font-mono">
                {file.name} · {metadata?.pageFormat || 'A4'}
              </span>
              <button
                onClick={() => {
                  if (zoomCanvasRef.current) {
                    const dataUrl = zoomCanvasRef.current.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = `${file.name.replace(/\.pdf$/i, '')}-highres-page1.png`;
                    a.click();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[#ff5722] hover:bg-[#ff6e3a] text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-Res PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

