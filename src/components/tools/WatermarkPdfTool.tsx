import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { 
  Upload, 
  Download, 
  FileCheck, 
  RefreshCw, 
  ArrowLeft, 
  Stamp
} from 'lucide-react';
import { ProcessedItem, ActiveView } from '../../types';
import { PdfDocumentPreview } from '../common/PdfDocumentPreview';
import { ContinueToSuggestions } from '../common/ContinueToSuggestions';
import { smoothScrollToTop } from '../../utils/scrollHelper';

interface WatermarkPdfToolProps {
  onBack: () => void;
  onRecordHistory: (item: ProcessedItem) => void;
  onNavigateToTool?: (tool: ActiveView, file?: File) => void;
  initialFile?: File | null;
}

type WatermarkPosition = 'center' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const WatermarkPdfTool: React.FC<WatermarkPdfToolProps> = ({ onBack, onRecordHistory, onNavigateToTool, initialFile }) => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(48);
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotation, setRotation] = useState<number>(45);
  const [position, setPosition] = useState<WatermarkPosition>('center');

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [resultFile, setResultFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
  };

  useEffect(() => {
    if (initialFile) {
      handleFile(initialFile);
    }
  }, [initialFile]);

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    smoothScrollToTop();
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x = width / 2 - textWidth / 2;
        let y = height / 2 - textHeight / 2;

        if (position === 'top') {
          y = height - 100;
        } else if (position === 'bottom') {
          y = 80;
        } else if (position === 'top-left') {
          x = 50;
          y = height - 100;
        } else if (position === 'top-right') {
          x = width - textWidth - 50;
          y = height - 100;
        } else if (position === 'bottom-left') {
          x = 50;
          y = 80;
        } else if (position === 'bottom-right') {
          x = width - textWidth - 50;
          y = 80;
        }

        page.drawText(text, {
          x: Math.max(20, x),
          y: Math.max(20, y),
          size: fontSize,
          font,
          color: rgb(1, 0.42, 0), // Vibrant neon orange!
          opacity,
          rotate: degrees(position === 'center' ? rotation : 0),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `makepdf_watermarked_${Date.now()}.pdf`;
      const sizeKb = Math.round(blob.size / 1024);
      const generatedFile = new File([blob], outName, { type: 'application/pdf' });

      setResultPdfUrl(url);
      setResultFilename(outName);
      setResultFile(generatedFile);
      smoothScrollToTop();

      onRecordHistory({
        id: Math.random().toString(36).substring(2, 9),
        filename: outName,
        tool: 'Watermark PDF',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        size: `${sizeKb} KB`,
        status: 'Completed',
        downloadUrl: url,
      });
    } catch (err) {
      console.error('Watermark error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (resultPdfUrl) URL.revokeObjectURL(resultPdfUrl);
    setFile(null);
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
          <span className="text-xs font-mono font-bold text-[#ff851a] tracking-wider uppercase">TOOL 07</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Watermark PDF</h1>
        </div>
      </div>

      {resultPdfUrl ? (
        /* Success Screen with Continue to... suggestions */
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#12121a] border border-[#ff6b00]/40 p-8 text-center max-w-2xl mx-auto shadow-[0_0_35px_rgba(255,107,0,0.15)]">
            <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00] flex items-center justify-center text-[#ff851a] mx-auto mb-5">
              <FileCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Watermark Applied!</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Your document has been sealed with "{text}" across all pages.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={resultPdfUrl}
                download={resultFilename}
                onClick={() => smoothScrollToTop()}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Watermarked PDF</span>
              </a>
              <button
                onClick={handleReset}
                className="py-3 px-6 rounded-xl font-medium text-neutral-300 bg-[#1c1c27] hover:bg-[#252535] border border-[#2e2e3f] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Watermark Another</span>
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
            <Stamp className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">
            Select or drag PDF to watermark
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mb-6">
            Apply custom confidential notices, copyright tags, or organization branding directly into PDF pages.
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
            title="Target Document Preview"
          />

          <div className="rounded-2xl bg-[#12121a] border border-[#252535] p-6 space-y-6">
            {/* Watermark text */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">Watermark Text:</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL, DRAFT, INTERNAL USE"
                className="w-full bg-[#0b0b0f] border border-[#2b2b3d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff6b00]"
              />
            </div>

            {/* Sliders: Size, Opacity, Rotation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Font Size</span>
                  <span className="text-[#ff851a] font-mono">{fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="96"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[#ff6b00]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Opacity</span>
                  <span className="text-[#ff851a] font-mono">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.9"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-[#ff6b00]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Rotation Angle</span>
                  <span className="text-[#ff851a] font-mono">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  step="5"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-[#ff6b00]"
                />
              </div>
            </div>

            {/* Position Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">Placement Position:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'center', label: 'Center (Diagonal)' },
                  { id: 'top', label: 'Top Header' },
                  { id: 'bottom', label: 'Bottom Footer' },
                  { id: 'top-left', label: 'Top Left' },
                  { id: 'top-right', label: 'Top Right' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                  { id: 'bottom-right', label: 'Bottom Right' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id as WatermarkPosition)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      position === pos.id
                        ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                        : 'bg-[#161622] border-[#252535] text-neutral-400'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleWatermark}
              disabled={isProcessing || !text.trim()}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,107,0,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Stamping Watermark...</span>
                </>
              ) : (
                <span>Stamp Watermark & Download</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
