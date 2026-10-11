import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  FileCheck, 
  RefreshCw, 
  Plus, 
  ArrowLeft,
  Sliders,
  Sparkles,
  Crop,
  Eye,
  Check,
  RotateCcw,
  X,
  Info,
  Maximize2,
  Layers,
  FolderUp,
  ArrowUpDown,
  FileStack,
  CheckCircle2
} from 'lucide-react';
import { ProcessedItem, ActiveView } from '../../types';
import { ContinueToSuggestions } from '../common/ContinueToSuggestions';
import { autoCropImage, AutoCropResult, CropRect } from '../../utils/autoCropImage';
import { smoothScrollToTop } from '../../utils/scrollHelper';

interface JpgToPdfToolProps {
  onBack: () => void;
  onRecordHistory: (item: ProcessedItem) => void;
  initialFiles?: FileList | null;
  onNavigateToTool?: (tool: ActiveView, file?: File) => void;
}

interface ImageItem {
  id: string;
  originalFile: File;
  croppedFile: File;
  activeFile: File;
  previewUrl: string;
  originalPreviewUrl: string;
  croppedPreviewUrl: string;
  name: string;
  sizeKb: number;
  originalDimensions: { width: number; height: number };
  croppedDimensions: { width: number; height: number };
  wasCropped: boolean;
  percentSaved: number;
  useCropped: boolean;
  cropRect?: CropRect;
}

export const JpgToPdfTool: React.FC<JpgToPdfToolProps> = ({ 
  onBack, 
  onRecordHistory, 
  initialFiles,
  onNavigateToTool 
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Original'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'medium' | 'large'>('small');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');

  // Smart Auto-Crop Controls
  const [autoCropEnabled, setAutoCropEnabled] = useState<boolean>(true);
  const [autoCropMode, setAutoCropMode] = useState<'balanced' | 'tight'>('balanced');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState({ current: 0, total: 0 });
  const [inspectItem, setInspectItem] = useState<ImageItem | null>(null);

  // Batch Processing Progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    currentName: string;
  }>({ current: 0, total: 0, percent: 0, currentName: '' });

  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);
  const [convertedFilename, setConvertedFilename] = useState<string>('');
  const [convertedSizeKb, setConvertedSizeKb] = useState<number>(0);
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [totalCroppedCount, setTotalCroppedCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      handleFiles(initialFiles);
    }
  }, [initialFiles]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsAnalyzing(true);
    setAnalyzingProgress({ current: 0, total: fileArray.length });

    const newItems: ImageItem[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setAnalyzingProgress({ current: i + 1, total: fileArray.length });

      try {
        const cropRes = await autoCropImage(file, autoCropMode);
        const shouldApply = autoCropEnabled && cropRes.wasCropped;
        const activeFile = shouldApply ? cropRes.croppedFile : file;
        const previewUrl = shouldApply ? cropRes.croppedPreviewUrl : cropRes.originalPreviewUrl;

        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          originalFile: file,
          croppedFile: cropRes.croppedFile,
          activeFile,
          previewUrl,
          originalPreviewUrl: cropRes.originalPreviewUrl,
          croppedPreviewUrl: cropRes.croppedPreviewUrl,
          name: file.name,
          sizeKb: Math.round(activeFile.size / 1024),
          originalDimensions: { width: cropRes.originalWidth, height: cropRes.originalHeight },
          croppedDimensions: { width: cropRes.croppedWidth, height: cropRes.croppedHeight },
          wasCropped: cropRes.wasCropped,
          percentSaved: cropRes.percentSaved,
          useCropped: shouldApply,
          cropRect: cropRes.cropRect,
        });
      } catch (err) {
        console.warn('Auto-crop fallback for:', file.name, err);
        const previewUrl = URL.createObjectURL(file);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          originalFile: file,
          croppedFile: file,
          activeFile: file,
          previewUrl,
          originalPreviewUrl: previewUrl,
          croppedPreviewUrl: previewUrl,
          name: file.name,
          sizeKb: Math.round(file.size / 1024),
          originalDimensions: { width: 0, height: 0 },
          croppedDimensions: { width: 0, height: 0 },
          wasCropped: false,
          percentSaved: 0,
          useCropped: false,
        });
      }
    }

    setImages((prev) => [...prev, ...newItems]);
    setIsAnalyzing(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const toggleImageCrop = (id: string) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id !== id) return img;
        const nextUseCropped = !img.useCropped;
        const activeFile = nextUseCropped ? img.croppedFile : img.originalFile;
        const previewUrl = nextUseCropped ? img.croppedPreviewUrl : img.originalPreviewUrl;
        return {
          ...img,
          useCropped: nextUseCropped,
          activeFile,
          previewUrl,
          sizeKb: Math.round(activeFile.size / 1024),
        };
      })
    );
  };

  const toggleAllAutoCrop = (enable: boolean) => {
    setAutoCropEnabled(enable);
    setImages((prev) =>
      prev.map((img) => {
        if (!img.wasCropped) return img;
        const useCropped = enable;
        const activeFile = useCropped ? img.croppedFile : img.originalFile;
        const previewUrl = useCropped ? img.croppedPreviewUrl : img.originalPreviewUrl;
        return {
          ...img,
          useCropped,
          activeFile,
          previewUrl,
          sizeKb: Math.round(activeFile.size / 1024),
        };
      })
    );
  };

  const reprocessAllImages = async (newMode: 'balanced' | 'tight') => {
    setAutoCropMode(newMode);
    if (images.length === 0) return;

    setIsAnalyzing(true);
    setAnalyzingProgress({ current: 0, total: images.length });

    const updated: ImageItem[] = [];
    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      setAnalyzingProgress({ current: i + 1, total: images.length });
      try {
        URL.revokeObjectURL(item.croppedPreviewUrl);
        const cropRes = await autoCropImage(item.originalFile, newMode);
        const shouldApply = autoCropEnabled && cropRes.wasCropped;
        const activeFile = shouldApply ? cropRes.croppedFile : item.originalFile;
        const previewUrl = shouldApply ? cropRes.croppedPreviewUrl : item.originalPreviewUrl;

        updated.push({
          ...item,
          croppedFile: cropRes.croppedFile,
          activeFile,
          previewUrl,
          croppedPreviewUrl: cropRes.croppedPreviewUrl,
          sizeKb: Math.round(activeFile.size / 1024),
          originalDimensions: { width: cropRes.originalWidth, height: cropRes.originalHeight },
          croppedDimensions: { width: cropRes.croppedWidth, height: cropRes.croppedHeight },
          wasCropped: cropRes.wasCropped,
          percentSaved: cropRes.percentSaved,
          useCropped: shouldApply,
          cropRect: cropRes.cropRect,
        });
      } catch {
        updated.push(item);
      }
    }

    setImages(updated);
    setIsAnalyzing(false);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const sortQueue = (criteria: 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc' | 'reverse') => {
    setImages((prev) => {
      const copy = [...prev];
      if (criteria === 'name-asc') {
        return copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      }
      if (criteria === 'name-desc') {
        return copy.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' }));
      }
      if (criteria === 'size-asc') {
        return copy.sort((a, b) => a.sizeKb - b.sizeKb);
      }
      if (criteria === 'size-desc') {
        return copy.sort((a, b) => b.sizeKb - a.sizeKb);
      }
      if (criteria === 'reverse') {
        return copy.reverse();
      }
      return copy;
    });
  };

  const deleteImage = (index: number) => {
    const target = images[index];
    URL.revokeObjectURL(target.originalPreviewUrl);
    if (target.croppedPreviewUrl !== target.originalPreviewUrl) {
      URL.revokeObjectURL(target.croppedPreviewUrl);
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    smoothScrollToTop();
    setIsProcessing(true);
    setBatchProgress({
      current: 1,
      total: images.length,
      percent: 0,
      currentName: images[0]?.name || '',
    });

    try {
      const pdfDoc = await PDFDocument.create();

      // Margins in points (72 points = 1 inch)
      const marginMap = {
        none: 0,
        small: 18,
        medium: 36,
        large: 54,
      };
      const marginVal = marginMap[margin];

      let croppedCount = 0;

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setBatchProgress({
          current: i + 1,
          total: images.length,
          percent: Math.round(((i + 1) / images.length) * 100),
          currentName: item.name,
        });

        // Yield execution briefly so UI shows the batch conversion step
        if (images.length > 2) {
          await new Promise((resolve) => setTimeout(resolve, 20));
        }

        if (item.useCropped) croppedCount++;
        const imageBytes = await item.activeFile.arrayBuffer();
        let pdfImage;

        // Auto-cropped images are high quality JPEG blobs
        if (item.activeFile.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        }

        // Determine page dimensions
        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === 'A4') {
          pageWidth = PageSizes.A4[0];
          pageHeight = PageSizes.A4[1];
        } else if (pageSize === 'Letter') {
          pageWidth = PageSizes.Letter[0];
          pageHeight = PageSizes.Letter[1];
        } else {
          pageWidth = pdfImage.width + marginVal * 2;
          pageHeight = pdfImage.height + marginVal * 2;
        }

        if (orientation === 'landscape' && pageSize !== 'Original') {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate fitted image dimensions within margins
        const availableWidth = pageWidth - marginVal * 2;
        const availableHeight = pageHeight - marginVal * 2;

        const scale = Math.min(
          availableWidth / pdfImage.width,
          availableHeight / pdfImage.height
        );

        const imgWidth = pdfImage.width * scale;
        const imgHeight = pdfImage.height * scale;

        const x = marginVal + (availableWidth - imgWidth) / 2;
        const y = marginVal + (availableHeight - imgHeight) / 2;

        page.drawImage(pdfImage, {
          x,
          y,
          width: imgWidth,
          height: imgHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outFilename = `makepdf_batch_${images.length}pages_${Date.now()}.pdf`;
      const sizeKb = Math.round(blob.size / 1024);
      const generatedFile = new File([blob], outFilename, { type: 'application/pdf' });

      setConvertedPdfUrl(url);
      setConvertedFilename(outFilename);
      setConvertedSizeKb(sizeKb);
      setConvertedFile(generatedFile);
      setTotalCroppedCount(croppedCount);
      smoothScrollToTop();

      // Record to dashboard history
      onRecordHistory({
        id: Math.random().toString(36).substring(2, 9),
        filename: outFilename,
        tool: images.length > 1 ? `JPG to PDF (Batch of ${images.length})` : 'JPG to PDF (Auto-Cropped)',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        size: `${sizeKb} KB`,
        status: 'Completed',
        downloadUrl: url,
      });
    } catch (err) {
      console.error('PDF Conversion error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalPreviewUrl);
      if (img.croppedPreviewUrl !== img.originalPreviewUrl) {
        URL.revokeObjectURL(img.croppedPreviewUrl);
      }
    });
    if (convertedPdfUrl) URL.revokeObjectURL(convertedPdfUrl);
    setImages([]);
    setConvertedPdfUrl(null);
    setConvertedFilename('');
    setConvertedSizeKb(0);
    setTotalCroppedCount(0);
    setBatchProgress({ current: 0, total: 0, percent: 0, currentName: '' });
  };

  return (
    <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-[#14141d] hover:bg-[#1f1f2b] border border-[#262635] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#ff851a] tracking-wider uppercase">TOOL 01</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Auto-Crop Active</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">JPG to PDF Converter</h1>
            <p className="text-xs text-neutral-400 mt-1">Convert multiple JPG, PNG, or WebP images into a clean PDF document.</p>
          </div>
        </div>

        {/* Quick status pill */}
        {images.length > 0 && (
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14141f] border border-[#262638] text-xs">
              <FileStack className="w-3.5 h-3.5 text-[#ff851a]" />
              <span className="text-white font-bold font-mono">{images.length}</span>
              <span className="text-neutral-400">Queued in Batch</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14141f] border border-[#262638] text-xs">
              <Crop className="w-3.5 h-3.5 text-[#ff851a]" />
              <span className="text-neutral-300">
                {images.filter((i) => i.useCropped).length}/{images.length} Auto-Cropped
              </span>
            </div>
          </div>
        )}
      </div>

      {convertedPdfUrl ? (
        /* Success Screen with Continue to... suggestions */
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#12121a] border border-[#ff6b00]/40 p-8 text-center max-w-2xl mx-auto shadow-[0_0_35px_rgba(255,107,0,0.15)]">
            <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00] flex items-center justify-center text-[#ff851a] mx-auto mb-5">
              <FileCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Batch PDF Converted Successfully!</h2>
            <p className="text-sm text-neutral-400 mb-4">
              All {images.length} queued images have been compiled into a single high-resolution PDF document.
            </p>

            {totalCroppedCount > 0 && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Clean Auto-Crop: {totalCroppedCount} photo backgrounds/desks removed</span>
              </div>
            )}

            <div className="bg-[#0b0b0f] p-4 rounded-xl border border-[#222230] text-left mb-6 font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">File Name:</span>
                <span className="text-white font-medium truncate max-w-[240px]">{convertedFilename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Pages in PDF:</span>
                <span className="text-[#ff851a] font-bold">{images.length} Pages</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Source Batch Queue:</span>
                <span className="text-neutral-300">{images.length} Images</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Compiled File Size:</span>
                <span className="text-white">{convertedSizeKb} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Auto-Cropped Photos:</span>
                <span className="text-emerald-400 font-semibold">{totalCroppedCount} / {images.length}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={convertedPdfUrl}
                download={convertedFilename}
                onClick={() => smoothScrollToTop()}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Batch PDF</span>
              </a>
              <button
                onClick={handleReset}
                className="py-3 px-6 rounded-xl font-medium text-neutral-300 bg-[#1c1c27] hover:bg-[#252535] border border-[#2e2e3f] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Convert Another Batch</span>
              </button>
            </div>
          </div>

          {/* Continue to... suggestions */}
          <ContinueToSuggestions
            onSelectTool={(tool, f) => onNavigateToTool ? onNavigateToTool(tool, f) : onBack()}
            currentPdfFile={convertedFile}
            onSeeMore={onBack}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Area: Upload & Image List (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Smart Auto-Crop Banner Notice */}
            <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-[#141420] to-[#12121a] border border-[#ff5722]/30 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ff5722]/15 border border-[#ff5722]/40 flex items-center justify-center text-[#ff851a] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Smart Document Auto-Crop</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Photos uploaded from cameras/phones are automatically edge-detected & cropped to remove table and background.
                  </p>
                </div>
              </div>

              {images.length > 0 && (
                <button
                  onClick={() => toggleAllAutoCrop(!autoCropEnabled)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all shrink-0 cursor-pointer ${
                    autoCropEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                      : 'bg-[#1b1b26] border-[#29293a] text-neutral-400 hover:text-white'
                  }`}
                  title="Toggle auto-crop for all images"
                >
                  {autoCropEnabled ? 'Auto-Crop: ON' : 'Auto-Crop: OFF'}
                </button>
              )}
            </div>

            {/* Analysis in Progress Notification */}
            {isAnalyzing && (
              <div className="p-3.5 rounded-xl bg-[#13131f] border border-[#ff851a]/40 flex items-center gap-3 animate-pulse">
                <RefreshCw className="w-4 h-4 text-[#ff851a] animate-spin shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white">
                    Auto-detecting document boundaries & cropping...
                  </span>{' '}
                  <span className="text-neutral-400">
                    ({analyzingProgress.current} of {analyzingProgress.total} processed)
                  </span>
                </div>
              </div>
            )}

            {images.length === 0 ? (
              /* Drag & Drop Bulk Upload Zone */
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-[#2f2f40] hover:border-[#ff6b00] bg-[#12121a]/80 hover:bg-[#151522] p-10 sm:p-14 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[400px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={folderInputRef}
                  onChange={(e) => handleFiles(e.target.files)}
                  multiple
                  {...({ webkitdirectory: '', directory: '' } as any)}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] group-hover:scale-110 group-hover:bg-[#ff6b00]/20 transition-all mb-4">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2 font-display">
                  Select or drag images to convert into PDF
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mb-6">
                  Convert JPG, PNG or WebP images into a single, clean PDF document.
                </p>

                <span className="px-5 py-2.5 rounded-lg text-xs font-bold text-black bg-[#ff851a] group-hover:bg-[#ff9933] transition-colors">
                  Select Image Files
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    folderInputRef.current?.click();
                  }}
                  className="text-[11px] text-neutral-400 hover:text-[#ff851a] transition-colors flex items-center gap-1 cursor-pointer mt-3"
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>or upload entire folder</span>
                </button>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181825] border border-[#282838] text-[11px] font-mono text-neutral-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Queue 1 to 100+ images</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181825] border border-[#282838] text-[11px] font-mono text-neutral-400">
                    <Sparkles className="w-3 h-3 text-[#ff5722]" />
                    <span>Smart document auto-crop</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181825] border border-[#282838] text-[11px] font-mono text-neutral-400">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>100% Client-side offline</span>
                  </span>
                </div>
              </div>
            ) : (
              /* Images List & Batch Queue Manager */
              <div className="space-y-4">
                {/* Batch Queue Control Toolbar */}
                <div className="p-4 rounded-xl bg-[#111118] border border-[#222232] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#ff5722]/15 border border-[#ff5722]/40 flex items-center justify-center text-[#ff851a] shrink-0">
                        <FileStack className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-display">
                            Batch Queue: {images.length} {images.length === 1 ? 'Image' : 'Images'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff5722]/20 text-[#ff851a] font-bold border border-[#ff5722]/30">
                            → 1 Combined PDF
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-mono">
                          Total source size: {(images.reduce((acc, i) => acc + i.sizeKb, 0) / 1024).toFixed(1)} MB • {images.filter((i) => i.useCropped).length} auto-cropped
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#ff5722] hover:bg-[#ff6934] text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Bulk Add Images</span>
                      </button>
                      <button
                        onClick={() => folderInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#191924] hover:bg-[#232332] border border-[#2e2e42] text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FolderUp className="w-3.5 h-3.5 text-[#ff851a]" />
                        <span>Add Folder</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFiles(e.target.files)}
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                      />
                      <input
                        type="file"
                        ref={folderInputRef}
                        onChange={(e) => handleFiles(e.target.files)}
                        multiple
                        {...({ webkitdirectory: '', directory: '' } as any)}
                        className="hidden"
                      />
                      <button
                        onClick={handleReset}
                        className="px-3 py-1.5 rounded-lg bg-[#191924] hover:bg-red-500/15 border border-[#2b2b3d] hover:border-red-500/40 text-xs font-semibold text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Clear Queue
                      </button>
                    </div>
                  </div>

                  {/* Secondary Queue Action Strip: Sorting & Batch Auto-Crop */}
                  <div className="pt-2.5 border-t border-[#1c1c28] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#ff851a]" />
                      <span className="text-[11px] font-semibold text-neutral-300">Sort Batch:</span>
                      <button
                        onClick={() => sortQueue('name-asc')}
                        className="px-2 py-0.5 rounded bg-[#181824] hover:bg-[#222232] border border-[#282838] text-[10px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      >
                        A → Z
                      </button>
                      <button
                        onClick={() => sortQueue('name-desc')}
                        className="px-2 py-0.5 rounded bg-[#181824] hover:bg-[#222232] border border-[#282838] text-[10px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Z → A
                      </button>
                      <button
                        onClick={() => sortQueue('size-desc')}
                        className="px-2 py-0.5 rounded bg-[#181824] hover:bg-[#222232] border border-[#282838] text-[10px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Size
                      </button>
                      <button
                        onClick={() => sortQueue('reverse')}
                        className="px-2 py-0.5 rounded bg-[#181824] hover:bg-[#222232] border border-[#282838] text-[10px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Reverse
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-neutral-500 hidden md:inline">Drag photos or add more to queue anytime</span>
                      <button
                        onClick={() => toggleAllAutoCrop(!autoCropEnabled)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                          autoCropEnabled 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                            : 'bg-[#181824] border-[#2b2b3d] text-neutral-400'
                        }`}
                      >
                        {autoCropEnabled ? 'Auto-Crop: All Active' : 'Auto-Crop: Disabled'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {images.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative rounded-xl bg-[#13131c] border border-[#222230] p-3 flex flex-col group hover:border-[#ff6b00]/50 transition-all shadow-sm"
                    >
                      {/* Image Thumbnail with Auto-crop Badge */}
                      <div className="w-full h-36 rounded-lg bg-black/80 overflow-hidden flex items-center justify-center relative mb-2.5">
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-black/80 text-[10px] font-mono text-white px-1.5 py-0.5 rounded shadow">
                          Page {index + 1}
                        </span>

                        {/* Top Right Auto-Crop status pill */}
                        {item.wasCropped ? (
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                            <span>{item.useCropped ? `Cropped (-${item.percentSaved}%)` : 'Original'}</span>
                          </div>
                        ) : (
                          <div className="absolute top-1.5 right-1.5 bg-black/80 border border-neutral-700 text-neutral-400 text-[10px] font-mono px-1.5 py-0.5 rounded">
                            Full Frame
                          </div>
                        )}

                        {/* Inspect / Compare Button */}
                        {item.wasCropped && (
                          <button
                            onClick={() => setInspectItem(item)}
                            title="Inspect Original vs Auto-Cropped"
                            className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/75 hover:bg-[#ff5722] text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Info & Cropping Toggle */}
                      <div className="space-y-1 mb-2">
                        <p className="text-xs font-semibold text-neutral-200 truncate" title={item.name}>
                          {item.name}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                          <span>{item.sizeKb} KB</span>
                          {item.wasCropped && (
                            <span className="text-emerald-400">
                              {item.useCropped ? `${item.croppedDimensions.width}×${item.croppedDimensions.height}` : `${item.originalDimensions.width}×${item.originalDimensions.height}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Interactive Crop Toggle Button */}
                      {item.wasCropped && (
                        <div className="mb-2 pt-1 border-t border-[#1d1d28]">
                          <button
                            onClick={() => toggleImageCrop(item.id)}
                            className={`w-full py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              item.useCropped
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                                : 'bg-[#1b1b26] hover:bg-[#232332] text-neutral-300 border border-[#2d2d3f]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Crop className="w-3 h-3 text-[#ff851a]" />
                              <span>{item.useCropped ? 'Auto-Crop Applied' : 'Using Original Photo'}</span>
                            </span>
                            <span className="text-[10px] font-mono underline">
                              {item.useCropped ? 'Undo' : 'Crop'}
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Bottom Reorder & Delete Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#1d1d28] mt-auto">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveImage(index, 'up')}
                            disabled={index === 0}
                            title="Move Earlier"
                            className="p-1 rounded bg-[#1c1c28] hover:bg-[#ff6b00]/20 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 hover:text-[#ff851a] cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveImage(index, 'down')}
                            disabled={index === images.length - 1}
                            title="Move Later"
                            className="p-1 rounded bg-[#1c1c28] hover:bg-[#ff6b00]/20 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 hover:text-[#ff851a] cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => deleteImage(index)}
                          title="Delete image"
                          className="p-1 rounded bg-[#1c1c28] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Area: Settings Sidebar (4 cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-[#12121a] border border-[#232332] p-6 space-y-6 sticky top-24 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-[#20202e]">
                <Sliders className="w-4 h-4 text-[#ff851a]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">PDF Layout Settings</h3>
              </div>

              {/* Smart Auto-Crop Controls */}
              <div className="p-3.5 rounded-xl bg-[#161622] border border-[#2a2a3d] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff851a]" />
                    <span className="text-xs font-bold text-white">Smart Auto-Crop</span>
                  </div>
                  <button
                    onClick={() => toggleAllAutoCrop(!autoCropEnabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoCropEnabled ? 'bg-[#ff5722]' : 'bg-[#2b2b3b]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        autoCropEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Removes desk, floor, and background shadows from phone camera photos.
                </p>

                {/* Crop Sensitivity Mode */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-mono text-neutral-400 uppercase">Crop Sensitivity</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => reprocessAllImages('balanced')}
                      className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                        autoCropMode === 'balanced'
                          ? 'bg-[#ff5722]/20 border-[#ff5722] text-[#ff851a]'
                          : 'bg-[#12121a] border-[#252535] text-neutral-400 hover:text-white'
                      }`}
                    >
                      Balanced (Auto)
                    </button>
                    <button
                      onClick={() => reprocessAllImages('tight')}
                      className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                        autoCropMode === 'tight'
                          ? 'bg-[#ff5722]/20 border-[#ff5722] text-[#ff851a]'
                          : 'bg-[#12121a] border-[#252535] text-neutral-400 hover:text-white'
                      }`}
                    >
                      Tight Trim
                    </button>
                  </div>
                </div>
              </div>

              {/* Page Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">Page Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['A4', 'Letter', 'Original'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setPageSize(sz)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        pageSize === sz
                          ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                          : 'bg-[#181824] border-[#252535] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">Orientation</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['portrait', 'landscape'] as const).map((ori) => (
                    <button
                      key={ori}
                      onClick={() => setOrientation(ori)}
                      className={`py-2 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                        orientation === ori
                          ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                          : 'bg-[#181824] border-[#252535] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {ori}
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">Page Margin</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['none', 'small', 'medium', 'large'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMargin(m)}
                      className={`py-2 text-[11px] font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                        margin === m
                          ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                          : 'bg-[#181824] border-[#252535] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Quality */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">Image Quality</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`py-2 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                        quality === q
                          ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                          : 'bg-[#181824] border-[#252535] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batch Queue Summary Box */}
              <div className="p-3.5 rounded-xl bg-[#0c0c12] border border-[#20202d] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Batch Queue:</span>
                  <span className="text-white font-bold font-mono">{images.length} {images.length === 1 ? 'image' : 'images'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Target Output:</span>
                  <span className="text-[#ff851a] font-semibold">1 Combined PDF</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Total Batch Size:</span>
                  <span className="text-neutral-300 font-mono">
                    {(images.reduce((acc, i) => acc + i.sizeKb, 0) / 1024).toFixed(1)} MB
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Page Layout:</span>
                  <span className="text-emerald-400 font-bold font-mono">{pageSize} • {orientation}</span>
                </div>
              </div>

              {/* Convert CTA */}
              <button
                onClick={handleConvert}
                disabled={images.length === 0 || isProcessing || isAnalyzing}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_20px_rgba(255,107,0,0.35)] transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling {batchProgress.current}/{batchProgress.total} ({batchProgress.percent}%)...</span>
                  </>
                ) : (
                  <>
                    <FileStack className="w-4 h-4" />
                    <span>
                      {images.length > 1
                        ? `Convert Batch to PDF (${images.length} Images)`
                        : 'Convert to PDF'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Batch Processing Overlay Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#12121a] border border-[#ff5722]/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#ff5722]/15 border border-[#ff5722] flex items-center justify-center text-[#ff851a] mx-auto animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white font-display">Batch Converting to PDF</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Stitching {batchProgress.total} images into a single high-quality PDF document.
              </p>
            </div>

            {/* Progress Bar & Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#ff851a] font-bold">
                  Page {batchProgress.current} of {batchProgress.total}
                </span>
                <span className="text-white font-bold">{batchProgress.percent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#1e1e2d] overflow-hidden border border-[#2c2c3d]">
                <div
                  className="h-full bg-gradient-to-r from-[#ff851a] to-[#ff5500] transition-all duration-150 rounded-full"
                  style={{ width: `${batchProgress.percent}%` }}
                />
              </div>
            </div>

            {/* Current Item Name */}
            <div className="p-2.5 rounded-lg bg-[#0c0c12] border border-[#232332] text-xs font-mono text-neutral-400 truncate text-left">
              Embedding: <span className="text-white font-semibold">{batchProgress.currentName || 'Processing...'}</span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Client-Side Memory Processing • Private & Offline</span>
            </div>
          </div>
        </div>
      )}

      {/* Inspect / Comparison Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#12121a] border border-[#2c2c3d] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#20202e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crop className="w-4 h-4 text-[#ff851a]" />
                <h3 className="text-sm font-bold text-white font-display">Auto-Crop Inspection: {inspectItem.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  -{inspectItem.percentSaved}% background trimmed
                </span>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 rounded-lg hover:bg-[#1f1f2d] text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original photo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300">Original User Photo</span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {inspectItem.originalDimensions.width} × {inspectItem.originalDimensions.height} px
                  </span>
                </div>
                <div className="w-full h-72 rounded-xl bg-black/60 border border-[#232332] p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={inspectItem.originalPreviewUrl}
                    alt="Original"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Full image including surrounding background, shadows, and margins.
                </p>
              </div>

              {/* Cropped document */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Cropped Document</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {inspectItem.croppedDimensions.width} × {inspectItem.croppedDimensions.height} px
                  </span>
                </div>
                <div className="w-full h-72 rounded-xl bg-black/60 border border-emerald-500/40 p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={inspectItem.croppedPreviewUrl}
                    alt="Auto-Cropped"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-emerald-300/80">
                  Main document bounds detected. Only this cleanly cropped document is embedded in the PDF.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#20202e] bg-[#0e0e15] flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Current status: <strong className={inspectItem.useCropped ? 'text-emerald-400' : 'text-neutral-300'}>
                  {inspectItem.useCropped ? 'Auto-Crop Selected' : 'Original Selected'}
                </strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    toggleImageCrop(inspectItem.id);
                    setInspectItem((prev) => prev ? { ...prev, useCropped: !prev.useCropped } : null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1f1f2e] hover:bg-[#2a2a3e] border border-[#333348] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  {inspectItem.useCropped ? 'Switch to Original' : 'Switch to Cropped'}
                </button>
                <button
                  onClick={() => setInspectItem(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#ff5722] hover:bg-[#ff6934] text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
