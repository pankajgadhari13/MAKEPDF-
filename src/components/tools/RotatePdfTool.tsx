import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { 
  Upload, 
  Download, 
  FileCheck, 
  RefreshCw, 
  ArrowLeft, 
  RotateCw
} from 'lucide-react';
import { ProcessedItem, ActiveView } from '../../types';
import { PdfDocumentPreview } from '../common/PdfDocumentPreview';
import { ContinueToSuggestions } from '../common/ContinueToSuggestions';
import { smoothScrollToTop } from '../../utils/scrollHelper';

interface RotatePdfToolProps {
  onBack: () => void;
  onRecordHistory: (item: ProcessedItem) => void;
  onNavigateToTool?: (tool: ActiveView, file?: File) => void;
  initialFile?: File | null;
}

export const RotatePdfTool: React.FC<RotatePdfToolProps> = ({ onBack, onRecordHistory, onNavigateToTool, initialFile }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [applyScope, setApplyScope] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>('1');

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [resultFile, setResultFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) {
      handleFile(initialFile);
    }
  }, [initialFile]);

  const handleFile = async (f: File) => {
    try {
      const buffer = await f.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      setFile(f);
      setPageCount(doc.getPageCount());
      setCustomRange(`1-${Math.min(2, doc.getPageCount())}`);
    } catch (e) {
      console.error('Error loading PDF:', e);
    }
  };

  const handleRotate = async () => {
    if (!file) return;
    smoothScrollToTop();
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      let targetIndices: number[] = [];
      if (applyScope === 'all') {
        targetIndices = pages.map((_, i) => i);
      } else {
        // parse customRange
        const setNums = new Set<number>();
        customRange.split(',').forEach((part) => {
          if (part.includes('-')) {
            const [s, e] = part.split('-');
            const start = parseInt(s, 10);
            const end = parseInt(e, 10);
            if (!isNaN(start) && !isNaN(end)) {
              for (let i = start; i <= end; i++) setNums.add(i - 1);
            }
          } else {
            const num = parseInt(part, 10);
            if (!isNaN(num)) setNums.add(num - 1);
          }
        });
        targetIndices = Array.from(setNums).filter((i) => i >= 0 && i < pages.length);
      }

      for (const idx of targetIndices) {
        const page = pages[idx];
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + angle) % 360));
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.pdf$/i, '') || 'document';
      const outName = `${baseName}_rotated.pdf`;
      const sizeKb = Math.round(blob.size / 1024);
      const generatedFile = new File([blob], outName, { type: 'application/pdf' });

      setResultPdfUrl(url);
      setResultFilename(outName);
      setResultFile(generatedFile);
      smoothScrollToTop();

      onRecordHistory({
        id: Math.random().toString(36).substring(2, 9),
        filename: outName,
        tool: 'Rotate PDF',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        size: `${sizeKb} KB`,
        status: 'Completed',
        downloadUrl: url,
      });
    } catch (err) {
      console.error('Rotate error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (resultPdfUrl) URL.revokeObjectURL(resultPdfUrl);
    setFile(null);
    setPageCount(0);
    setResultPdfUrl(null);
  };

  return (
    <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-[#14141d] hover:bg-[#1f1f2b] border border-[#262635] text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono font-bold text-[#ff851a] tracking-wider uppercase">TOOL 06</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Rotate PDF Pages</h1>
        </div>
      </div>

      {resultPdfUrl ? (
        /* Success Screen with Continue to... suggestions */
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#12121a] border border-[#ff6b00]/40 p-8 text-center max-w-2xl mx-auto shadow-[0_0_35px_rgba(255,107,0,0.15)]">
            <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00] flex items-center justify-center text-[#ff851a] mx-auto mb-5">
              <FileCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">PDF Rotated Successfully!</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Orientation adjusted by {angle}° with permanent page layout saving.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={resultPdfUrl}
                download={resultFilename}
                onClick={() => smoothScrollToTop()}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Rotated PDF</span>
              </a>
              <button
                onClick={handleReset}
                className="py-3 px-6 rounded-xl font-medium text-neutral-300 bg-[#1c1c27] hover:bg-[#252535] border border-[#2e2e3f] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Rotate Another</span>
              </button>
            </div>
          </div>

          {/* Continue to... suggestions */}
          <ContinueToSuggestions
            onSelectTool={(tool, f) => onNavigateToTool ? onNavigateToTool(tool, f) : onBack()}
            currentPdfFile={resultFile}
            onSeeMore={onBack}
          />
        </div>
      ) : !file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-[#2f2f40] hover:border-[#ff6b00] bg-[#12121a]/80 hover:bg-[#151522] p-12 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[350px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept="application/pdf"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] group-hover:scale-110 group-hover:bg-[#ff6b00]/20 transition-all mb-4">
            <RotateCw className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">
            Select or drag PDF to rotate
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mb-6">
            Rotate individual pages or all pages 90°, 180°, or 270° clockwise.
          </p>
          <span className="px-5 py-2.5 rounded-lg text-xs font-bold text-black bg-[#ff851a] group-hover:bg-[#ff9933] transition-colors">
            Select PDF File
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          <PdfDocumentPreview
            file={file}
            onReplaceFile={handleReset}
            title="Document Orientation Preview"
          />

          <div className="rounded-2xl bg-[#12121a] border border-[#252535] p-6 space-y-6">
            {/* Rotation Degrees */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 block">Rotate Degrees Clockwise:</label>
            <div className="grid grid-cols-3 gap-3">
              {([90, 180, 270] as const).map((deg) => (
                <button
                  key={deg}
                  onClick={() => setAngle(deg)}
                  className={`py-3 text-sm font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    angle === deg
                      ? 'bg-[#ff6b00]/20 border-[#ff6b00] text-[#ff851a]'
                      : 'bg-[#151520] border-[#252535] text-neutral-300'
                  }`}
                >
                  <RotateCw className={`w-4 h-4 ${deg === 180 ? 'rotate-90' : deg === 270 ? 'rotate-180' : ''}`} />
                  <span>{deg}°</span>
                </button>
              ))}
            </div>
          </div>

          {/* Apply Scope */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 block">Apply To:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setApplyScope('all')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  applyScope === 'all'
                    ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                    : 'bg-[#161622] border-[#252535] text-neutral-400'
                }`}
              >
                All Pages ({pageCount})
              </button>
              <button
                onClick={() => setApplyScope('custom')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  applyScope === 'custom'
                    ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                    : 'bg-[#161622] border-[#252535] text-neutral-400'
                }`}
              >
                Specific Pages
              </button>
            </div>
          </div>

          {applyScope === 'custom' && (
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 block">Enter Page Range (e.g. 1-2, 4):</label>
              <input
                type="text"
                value={customRange}
                onChange={(e) => setCustomRange(e.target.value)}
                className="w-full bg-[#0b0b0f] border border-[#2b2b3d] rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#ff6b00]"
              />
            </div>
          )}

          <button
            onClick={handleRotate}
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,107,0,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Rotating Pages...</span>
              </>
            ) : (
              <span>Apply Rotation & Save PDF</span>
            )}
          </button>
        </div>
        </div>
      )}
    </div>
  );
};
