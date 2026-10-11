import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Upload, 
  Download, 
  FileCheck, 
  RefreshCw, 
  ArrowLeft,
  Scissors
} from 'lucide-react';
import { ProcessedItem, ActiveView } from '../../types';
import { PdfDocumentPreview } from '../common/PdfDocumentPreview';
import { ContinueToSuggestions } from '../common/ContinueToSuggestions';
import { smoothScrollToTop } from '../../utils/scrollHelper';

interface SplitPdfToolProps {
  onBack: () => void;
  onRecordHistory: (item: ProcessedItem) => void;
  onNavigateToTool?: (tool: ActiveView, file?: File) => void;
  initialFile?: File | null;
}

export const SplitPdfTool: React.FC<SplitPdfToolProps> = ({ onBack, onRecordHistory, onNavigateToTool, initialFile }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'range' | 'extract'>('range');
  const [rangeInput, setRangeInput] = useState<string>('1-2');
  const [selectedPages, setSelectedPages] = useState<number[]>([1]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [resultSizeKb, setResultSizeKb] = useState<number>(0);
  const [resultFile, setResultFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    try {
      const buffer = await f.arrayBuffer();
      const doc = await PDFDocument.load(buffer);
      const count = doc.getPageCount();

      setFile(f);
      setPageCount(count);
      setSelectedPages(Array.from({ length: count }, (_, i) => i + 1));
      setRangeInput(count > 1 ? `1-${Math.min(2, count)}` : '1');
    } catch (err) {
      console.error('Failed to parse PDF', err);
    }
  };

  React.useEffect(() => {
    if (initialFile) {
      handleFile(initialFile);
    }
  }, [initialFile]);

  const parseRanges = (input: string, max: number): number[] => {
    const indices: Set<number> = new Set();
    const parts = input.split(',').map((p) => p.trim());

    parts.forEach((part) => {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(max, end); i++) {
            indices.add(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= max) {
          indices.add(num);
        }
      }
    });

    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) return;
    smoothScrollToTop();
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const sourceDoc = await PDFDocument.load(buffer);
      const splitDoc = await PDFDocument.create();

      let targetPages: number[] = [];
      if (splitMode === 'range') {
        targetPages = parseRanges(rangeInput, pageCount);
      } else {
        targetPages = selectedPages;
      }

      if (targetPages.length === 0) {
        alert('Please specify at least one valid page to split or extract.');
        setIsProcessing(false);
        return;
      }

      // Convert 1-based page numbers to 0-based indices
      const pageIndices = targetPages.map((p) => p - 1);
      const copiedPages = await splitDoc.copyPages(sourceDoc, pageIndices);
      copiedPages.forEach((page) => splitDoc.addPage(page));

      const pdfBytes = await splitDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.pdf$/i, '') || 'document';
      const outName = `${baseName}_split.pdf`;
      const sizeKb = Math.round(blob.size / 1024);
      const generatedFile = new File([blob], outName, { type: 'application/pdf' });

      setResultPdfUrl(url);
      setResultFilename(outName);
      setResultSizeKb(sizeKb);
      setResultFile(generatedFile);
      smoothScrollToTop();

      onRecordHistory({
        id: Math.random().toString(36).substring(2, 9),
        filename: outName,
        tool: 'Split PDF',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        size: `${sizeKb} KB`,
        status: 'Completed',
        downloadUrl: url,
      });
    } catch (err) {
      console.error('Split error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (resultPdfUrl) URL.revokeObjectURL(resultPdfUrl);
    setFile(null);
    setPageCount(0);
    setResultPdfUrl(null);
    setResultFilename('');
  };

  const togglePageSelection = (pageNum: number) => {
    if (selectedPages.includes(pageNum)) {
      if (selectedPages.length === 1) return; // Keep at least one
      setSelectedPages(selectedPages.filter((p) => p !== pageNum));
    } else {
      setSelectedPages([...selectedPages, pageNum].sort((a, b) => a - b));
    }
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
          <span className="text-xs font-mono font-bold text-[#ff851a] tracking-wider uppercase">TOOL 03</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Split & Extract PDF</h1>
        </div>
      </div>

      {resultPdfUrl ? (
        /* Success Screen with Continue to... suggestions */
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#12121a] border border-[#ff6b00]/40 p-8 text-center max-w-2xl mx-auto shadow-[0_0_35px_rgba(255,107,0,0.15)]">
          <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00] flex items-center justify-center text-[#ff851a] mx-auto mb-5">
            <FileCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 font-display">Pages Extracted!</h2>
          <p className="text-sm text-neutral-400 mb-6">
            Your customized PDF with selected pages is ready for download.
          </p>

          <div className="bg-[#0b0b0f] p-4 rounded-xl border border-[#222230] text-left mb-6 font-mono text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-500">Output File:</span>
              <span className="text-white font-medium truncate max-w-[240px]">{resultFilename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">File Size:</span>
              <span className="text-white">{resultSizeKb} KB</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={resultPdfUrl}
              download={resultFilename}
              onClick={() => smoothScrollToTop()}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Extracted PDF</span>
            </a>
            <button
              onClick={handleReset}
              className="py-3 px-6 rounded-xl font-medium text-neutral-300 bg-[#1c1c27] hover:bg-[#252535] border border-[#2e2e3f] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Split Another</span>
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
        /* Upload box */
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
            <Scissors className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">
            Select or drag PDF to split
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mb-6">
            Extract custom page ranges (e.g. 1-3, 5-8) or select individual pages visually.
          </p>
          <span className="px-5 py-2.5 rounded-lg text-xs font-bold text-black bg-[#ff851a] group-hover:bg-[#ff9933] transition-colors">
            Choose PDF File
          </span>
        </div>
      ) : (
        /* Split Config Workspace */
        <div className="space-y-6">
          <PdfDocumentPreview
            file={file}
            onReplaceFile={handleReset}
            title="Document to Split"
          />

          <div className="rounded-2xl bg-[#12121a] border border-[#252535] p-6 space-y-6">
            {/* Split Mode Selector */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#20202e]">
              <button
                onClick={() => setSplitMode('range')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  splitMode === 'range'
                    ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                    : 'bg-[#181824] border-[#252535] text-neutral-400'
                }`}
              >
                By Page Range (e.g. 1-3)
              </button>
              <button
                onClick={() => setSplitMode('extract')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  splitMode === 'extract'
                    ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                    : 'bg-[#181824] border-[#252535] text-neutral-400'
                }`}
              >
                Select Individual Pages
              </button>
            </div>

            {splitMode === 'range' ? (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Enter Page Ranges or Numbers (comma separated)
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder={`e.g. 1-2, 4, 5-${pageCount}`}
                  className="w-full bg-[#0b0b0f] border border-[#2b2b3d] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#ff6b00]"
                />
                <p className="text-[11px] text-neutral-500">
                  Example: <span className="font-mono text-neutral-300">1-3</span> will extract pages 1, 2, and 3. <span className="font-mono text-neutral-300">1, 4, 6</span> will extract those specific pages.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-neutral-300 block">
                  Click pages to include in the output:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => {
                    const isSelected = selectedPages.includes(num);
                    return (
                      <button
                        key={num}
                        onClick={() => togglePageSelection(num)}
                        className={`h-14 rounded-lg flex flex-col items-center justify-center border font-mono text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#ff6b00]/20 border-[#ff6b00] text-[#ff851a]'
                            : 'bg-[#161622] border-[#262635] text-neutral-400 hover:border-[#ff6b00]/40'
                        }`}
                      >
                        <span className="text-[10px] text-neutral-500">P.</span>
                        <span>{num}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleSplit}
              disabled={isProcessing}
              className="w-full py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,107,0,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Pages...</span>
                </>
              ) : (
                <span>Extract & Generate PDF</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
