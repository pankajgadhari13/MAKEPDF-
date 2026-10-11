import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  ArrowLeft, 
  FileText, 
  FileCheck, 
  FileCode,
  Sparkles,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import { ProcessedItem, ActiveView } from '../../types';
import { ContinueToSuggestions } from '../common/ContinueToSuggestions';
import { smoothScrollToTop } from '../../utils/scrollHelper';

interface WordToPdfToolProps {
  onBack: () => void;
  onRecordHistory: (item: ProcessedItem) => void;
  onNavigateToTool?: (tool: ActiveView, file?: File) => void;
  initialFile?: File | null;
}

export const WordToPdfTool: React.FC<WordToPdfToolProps> = ({
  onBack,
  onRecordHistory,
  onNavigateToTool,
  initialFile
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedHtml, setExtractedHtml] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [includePageNumbers, setIncludePageNumbers] = useState(true);

  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [resultSizeKb, setResultSizeKb] = useState<number>(0);
  const [resultPages, setResultPages] = useState<number>(0);
  const [resultFile, setResultFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const buffer = await selectedFile.arrayBuffer();

      // Attempt 1: Mammoth docx conversion
      let htmlOutput = '';
      let textOutput = '';

      try {
        const mammothResult = await mammoth.convertToHtml({ arrayBuffer: buffer });
        htmlOutput = mammothResult.value;

        const textResult = await mammoth.extractRawText({ arrayBuffer: buffer });
        textOutput = textResult.value;
      } catch (mammothErr) {
        console.warn('Mammoth parsing fallback to JSZip:', mammothErr);

        // Fallback: Parse DOCX (ZIP archive) using JSZip directly
        const zip = await JSZip.loadAsync(buffer);
        const documentXml = await zip.file('word/document.xml')?.async('text');

        if (documentXml) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(documentXml, 'application/xml');
          const paragraphs = xmlDoc.getElementsByTagName('w:p');
          const pTexts: string[] = [];

          for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i];
            const textNodes = p.getElementsByTagName('w:t');
            let pStr = '';
            for (let j = 0; j < textNodes.length; j++) {
              pStr += textNodes[j].textContent || '';
            }
            if (pStr.trim()) {
              pTexts.push(pStr);
            }
          }
          textOutput = pTexts.join('\n\n');
          htmlOutput = pTexts.map(t => `<p>${t}</p>`).join('');
        } else {
          // Fallback if plain text or binary
          const dec = new TextDecoder('utf-8');
          textOutput = dec.decode(buffer.slice(0, 5000)).replace(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g, '');
          htmlOutput = `<pre>${textOutput}</pre>`;
        }
      }

      setExtractedHtml(htmlOutput);
      setExtractedText(textOutput);

      const words = textOutput.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    } catch (err) {
      console.error('Word file read error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (initialFile) {
      handleFileSelect(initialFile);
    }
  }, [initialFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.name.endsWith('.docx') ||
        droppedFile.name.endsWith('.doc') ||
        droppedFile.type.includes('word') ||
        droppedFile.type.includes('document')
      ) {
        handleFileSelect(droppedFile);
      }
    }
  };

  const handleConvert = async () => {
    if (!file || !extractedText) return;
    smoothScrollToTop();
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      // Configure Page Dimensions
      let baseWidth = pageSize === 'A4' ? 595.28 : 612.0;
      let baseHeight = pageSize === 'A4' ? 841.89 : 792.0;

      const pageWidth = orientation === 'portrait' ? baseWidth : baseHeight;
      const pageHeight = orientation === 'portrait' ? baseHeight : baseWidth;

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 54; // 0.75 inch margins
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      const baseFontSize = fontSize === 'small' ? 9.5 : fontSize === 'large' ? 12 : 10.5;
      const lineHeight = baseFontSize * 1.45;

      // Word wrapping helper
      const wrapText = (text: string, maxWidth: number, fontToUse: any, fSize: number): string[] => {
        const lines: string[] = [];
        const words = text.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = fontToUse.widthOfTextAtSize(testLine, fSize);

          if (width <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }

        if (currentLine) lines.push(currentLine);
        return lines;
      };

      // Split text into paragraphs
      const paragraphs = extractedText.split(/\r?\n+/).map(p => p.trim()).filter(Boolean);

      // Collect all lines to render
      interface RenderLine {
        text: string;
        isHeading: boolean;
        isSpaced: boolean;
      }
      const allLines: RenderLine[] = [];

      // Document title header
      const cleanDocTitle = file.name.replace(/\.[^/.]+$/, '');
      allLines.push({ text: cleanDocTitle, isHeading: true, isSpaced: true });

      paragraphs.forEach((p, idx) => {
        // Detect possible heading
        const isHeading = p.length < 80 && (p.toUpperCase() === p || !p.endsWith('.'));
        const fSize = isHeading ? baseFontSize + 2.5 : baseFontSize;
        const fontToUse = isHeading ? fontBold : font;

        const wrapped = wrapText(p, contentWidth, fontToUse, fSize);
        wrapped.forEach((lineText, lineIdx) => {
          allLines.push({
            text: lineText,
            isHeading,
            isSpaced: lineIdx === wrapped.length - 1 && idx < paragraphs.length - 1
          });
        });
      });

      // Pagination logic
      const linesPerPage = Math.floor(contentHeight / lineHeight) - 2;
      const totalPagesEstimate = Math.max(1, Math.ceil(allLines.length / linesPerPage));

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin - 20;
      let pageIndex = 1;

      // Draw top header rule
      currentPage.drawLine({
        start: { x: margin, y: pageHeight - margin + 8 },
        end: { x: pageWidth - margin, y: pageHeight - margin + 8 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });

      for (let i = 0; i < allLines.length; i++) {
        const item = allLines[i];
        const lineFontSize = item.isHeading ? baseFontSize + 2.5 : baseFontSize;
        const lineFont = item.isHeading ? fontBold : font;
        const lineSpacing = item.isSpaced ? lineHeight * 1.5 : lineHeight;

        if (currentY - lineSpacing < margin + 20) {
          // Add page number to current page before breaking
          if (includePageNumbers) {
            currentPage.drawText(`Page ${pageIndex} of ${totalPagesEstimate}`, {
              x: pageWidth / 2 - 30,
              y: margin - 15,
              size: 8.5,
              font,
              color: rgb(0.5, 0.5, 0.5),
            });
          }

          // New page
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          pageIndex++;
          currentY = pageHeight - margin - 20;

          currentPage.drawLine({
            start: { x: margin, y: pageHeight - margin + 8 },
            end: { x: pageWidth - margin, y: pageHeight - margin + 8 },
            thickness: 0.5,
            color: rgb(0.8, 0.8, 0.8),
          });
        }

        // Draw line text
        currentPage.drawText(item.text, {
          x: margin,
          y: currentY,
          size: lineFontSize,
          font: lineFont,
          color: item.isHeading ? rgb(0.1, 0.1, 0.15) : rgb(0.2, 0.2, 0.2),
        });

        currentY -= lineSpacing;
      }

      // Final page footer
      if (includePageNumbers) {
        currentPage.drawText(`Page ${pageIndex} of ${pageIndex}`, {
          x: pageWidth / 2 - 30,
          y: margin - 15,
          size: 8.5,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outFilename = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
      const sizeKb = Math.round(blob.size / 1024);
      const generatedFile = new File([blob], outFilename, { type: 'application/pdf' });

      setResultPdfUrl(url);
      setResultFilename(outFilename);
      setResultSizeKb(sizeKb);
      setResultPages(pageIndex);
      setResultFile(generatedFile);
      smoothScrollToTop();

      onRecordHistory({
        id: Math.random().toString(36).substring(2, 9),
        filename: outFilename,
        tool: 'Word to PDF',
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        size: `${sizeKb} KB`,
        status: 'Completed',
        downloadUrl: url,
      });
    } catch (err) {
      console.error('Word to PDF compilation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (resultPdfUrl) URL.revokeObjectURL(resultPdfUrl);
    setFile(null);
    setExtractedHtml('');
    setExtractedText('');
    setResultPdfUrl(null);
    setResultFilename('');
    setResultSizeKb(0);
    setResultPages(0);
    setResultFile(null);
  };

  return (
    <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Title Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-[#14141d] hover:bg-[#1f1f2b] border border-[#262635] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to tools"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#ff851a] tracking-wider uppercase">TOOL 10</span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ff5722]/15 border border-[#ff5722]/30 text-[#ff851a] text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-[#ff5722]" />
                <span>DOCX to PDF</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Word to PDF Converter</h1>
          </div>
        </div>
      </div>

      {resultPdfUrl ? (
        /* Success Screen */
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#12121a] border border-[#ff6b00]/40 p-8 text-center max-w-2xl mx-auto shadow-[0_0_35px_rgba(255,107,0,0.15)]">
            <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00] flex items-center justify-center text-[#ff851a] mx-auto mb-5">
              <FileCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Word Document Converted to PDF!</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Your document has been compiled with crisp typography, layout preservation, and standard pagination.
            </p>

            <div className="bg-[#0b0b0f] p-4 rounded-xl border border-[#222230] text-left mb-6 font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Output PDF:</span>
                <span className="text-white font-medium truncate max-w-[240px]">{resultFilename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Pages:</span>
                <span className="text-[#ff851a] font-bold">{resultPages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">File Size:</span>
                <span className="text-white">{resultSizeKb} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Source Words:</span>
                <span className="text-emerald-400 font-semibold">{wordCount} words</span>
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
                <span>Download PDF File</span>
              </a>
              <button
                onClick={handleReset}
                className="py-3 px-6 rounded-xl font-medium text-neutral-300 bg-[#1c1c27] hover:bg-[#252535] border border-[#2e2e3f] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Convert Another File</span>
              </button>
            </div>
          </div>

          <ContinueToSuggestions
            onSelectTool={(tool, f) => onNavigateToTool ? onNavigateToTool(tool, f) : onBack()}
            currentPdfFile={resultFile}
            onSeeMore={onBack}
          />
        </div>
      ) : (
        /* Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {!file ? (
              /* Upload Zone */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-[#2f2f40] hover:border-[#ff6b00] bg-[#12121a]/80 hover:bg-[#151522] p-10 sm:p-14 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[380px]"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] group-hover:scale-110 group-hover:bg-[#ff6b00]/20 transition-all mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-display">
                  Upload Word Document (.DOCX / .DOC)
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mb-4">
                  Drag and drop your Microsoft Word document here or click to browse. Instant client-side conversion without cloud uploads.
                </p>

                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181825] border border-[#282838] text-[11px] font-mono text-neutral-300">
                    <Sparkles className="w-3 h-3 text-[#ff5722]" />
                    <span>Supports .docx, tables, headings & lists</span>
                  </span>
                </div>

                <span className="px-5 py-2.5 rounded-lg text-xs font-bold text-black bg-[#ff851a] group-hover:bg-[#ff9933] shadow-[0_0_15px_rgba(255,133,26,0.3)] transition-colors">
                  Select Word Document
                </span>
              </div>
            ) : (
              /* Document Loaded & Preview */
              <div className="space-y-4">
                {/* File Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#12121a] border border-[#232332]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#ff5722]/15 border border-[#ff5722]/30 flex items-center justify-center text-[#ff851a] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        {Math.round(file.size / 1024)} KB • {wordCount} words detected
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-[#191924] hover:bg-red-500/10 border border-[#2b2b3d] hover:border-red-500/40 text-xs font-semibold text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Change File
                  </button>
                </div>

                {/* Formatted Document Content Preview */}
                <div className="rounded-2xl bg-[#12121a] border border-[#232332] overflow-hidden">
                  <div className="px-4 py-3 bg-[#161622] border-b border-[#222232] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-neutral-300 font-medium">
                      <Eye className="w-4 h-4 text-[#ff851a]" />
                      <span>Document Text & Structure Preview</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      Ready to Convert
                    </span>
                  </div>

                  <div className="p-6 max-h-[460px] overflow-y-auto space-y-3 bg-[#0d0d14] font-sans text-sm text-neutral-200 leading-relaxed">
                    {extractedHtml ? (
                      <div 
                        className="prose prose-invert max-w-none prose-p:mb-2 prose-headings:text-white prose-headings:font-bold"
                        dangerouslySetInnerHTML={{ __html: extractedHtml }}
                      />
                    ) : (
                      <pre className="font-mono text-xs whitespace-pre-wrap text-neutral-300">
                        {extractedText}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Settings & Convert Action (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-[#12121a] border border-[#232332] p-6 space-y-6 sticky top-24 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-[#20202e]">
                <Sliders className="w-4 h-4 text-[#ff851a]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">PDF Output Settings</h3>
              </div>

              {/* Page Format */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">Page Standard</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['A4', 'Letter'] as const).map((sz) => (
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

              {/* Font Sizing */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">Typography Scale</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'normal', 'large'] as const).map((fs) => (
                    <button
                      key={fs}
                      onClick={() => setFontSize(fs)}
                      className={`py-2 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                        fontSize === fs
                          ? 'bg-[#ff6b00]/15 border-[#ff6b00] text-[#ff851a]'
                          : 'bg-[#181824] border-[#252535] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {fs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Numbering Option */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#161622] border border-[#262638]">
                <div className="text-xs">
                  <p className="font-semibold text-white">Include Page Numbers</p>
                  <p className="text-[11px] text-neutral-400">Add footer numbering (e.g. Page 1 of 3)</p>
                </div>
                <button
                  onClick={() => setIncludePageNumbers(!includePageNumbers)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors cursor-pointer ${
                    includePageNumbers
                      ? 'bg-[#ff5722] border-[#ff5722] text-white'
                      : 'border-[#3f3f50] bg-transparent'
                  }`}
                  aria-label="Toggle page numbering"
                >
                  {includePageNumbers && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Convert CTA */}
              <button
                onClick={handleConvert}
                disabled={!file || !extractedText || isProcessing}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Converting Word to PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Convert to PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
