import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
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
  FileText,
  Eye
} from 'lucide-react';
import { ProcessedItem, ActiveView } from '../../types';
import { PdfDocumentPreview } from '../common/PdfDocumentPreview';
import { ContinueToSuggestions } from '../common/ContinueToSuggestions';
import { smoothScrollToTop } from '../../utils/scrollHelper';

interface MergePdfToolProps {
  onBack: () => void;
  onRecordHistory: (item: ProcessedItem) => void;
  onNavigateToTool?: (tool: ActiveView, file?: File) => void;
  initialFile?: File | null;
}

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  sizeKb: number;
  pageCount: number;
}

export const MergePdfTool: React.FC<MergePdfToolProps> = ({ onBack, onRecordHistory, onNavigateToTool, initialFile }) => {
  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([]);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedFilename, setMergedFilename] = useState<string>('');
  const [mergedSizeKb, setMergedSizeKb] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [mergedFile, setMergedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialFile) {
      const addSingle = async () => {
        try {
          const buffer = await initialFile.arrayBuffer();
          const doc = await PDFDocument.load(buffer);
          const count = doc.getPageCount();
          setPdfFiles((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              file: initialFile,
              name: initialFile.name,
              sizeKb: Math.round(initialFile.size / 1024),
              pageCount: count,
            },
          ]);
        } catch {
          setPdfFiles((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              file: initialFile,
              name: initialFile.name,
              sizeKb: Math.round(initialFile.size / 1024),
              pageCount: 1,
            },
          ]);
        }
      };
      addSingle();
    }
  }, [initialFile]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: PdfFileItem[] = [];

    for (const file of Array.from(files)) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          const buffer = await file.arrayBuffer();
          const doc = await PDFDocument.load(buffer);
          const count = doc.getPageCount();

          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            sizeKb: Math.round(file.size / 1024),
            pageCount: count,
          });
        } catch (e) {
          console.warn('Failed reading page count for', file.name, e);
          newItems.push({
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            sizeKb: Math.round(file.size / 1024),
            pageCount: 1,
          });
        }
      }
    }

    setPdfFiles((prev) => [...prev, ...newItems]);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pdfFiles.length) return;
    const updated = [...pdfFiles];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPdfFiles(updated);
  };

  const deleteFile = (index: number) => {
    setPdfFiles(pdfFiles.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) return;
    smoothScrollToTop();
    setIsProcessing(true);

    try {
      const mergedDoc = await PDFDocument.create();
      let totalCount = 0;

      for (const item of pdfFiles) {
        const fileBuffer = await item.file.arrayBuffer();
        const sourceDoc = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedDoc.copyPages(sourceDoc, sourceDoc.getPageIndices());
        copiedPages.forEach((page) => mergedDoc.addPage(page));
        totalCount += copiedPages.length;
      }

      const mergedPdfBytes = await mergedDoc.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const firstBase = pdfFiles[0]?.file.name.replace(/\.pdf$/i, '') || 'document';
      const outFilename = `${firstBase}_merged.pdf`;
      const sizeKb = Math.round(blob.size / 1024);
      const generatedFile = new File([blob], outFilename, { type: 'application/pdf' });

      setMergedPdfUrl(url);
      setMergedFilename(outFilename);
      setMergedSizeKb(sizeKb);
      setTotalPages(totalCount);
      setMergedFile(generatedFile);
      smoothScrollToTop();

      onRecordHistory({
        id: Math.random().toString(36).substring(2, 9),
        filename: outFilename,
        tool: 'Merge PDF',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        size: `${sizeKb} KB`,
        status: 'Completed',
        downloadUrl: url,
      });
    } catch (err) {
      console.error('Merge PDF error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
    setPdfFiles([]);
    setMergedPdfUrl(null);
    setMergedFilename('');
    setMergedSizeKb(0);
    setTotalPages(0);
  };

  return (
    <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-[#14141d] hover:bg-[#1f1f2b] border border-[#262635] text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-mono font-bold text-[#ff851a] tracking-wider uppercase">TOOL 02</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Merge PDF Files</h1>
        </div>
      </div>

      {mergedPdfUrl ? (
        /* Success Screen with Continue to... suggestions */
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#12121a] border border-[#ff6b00]/40 p-8 text-center max-w-2xl mx-auto shadow-[0_0_35px_rgba(255,107,0,0.15)]">
            <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00] flex items-center justify-center text-[#ff851a] mx-auto mb-5">
              <FileCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">PDFs Merged Successfully!</h2>
            <p className="text-sm text-neutral-400 mb-6">
              All your files have been stitched into a single, cohesive PDF document.
            </p>

            <div className="bg-[#0b0b0f] p-4 rounded-xl border border-[#222230] text-left mb-6 font-mono text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-500">Result File:</span>
                <span className="text-white font-medium truncate max-w-[240px]">{mergedFilename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Pages:</span>
                <span className="text-[#ff851a] font-bold">{totalPages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Output Size:</span>
                <span className="text-white">{mergedSizeKb} KB</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={mergedPdfUrl}
                download={mergedFilename}
                onClick={() => smoothScrollToTop()}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,107,0,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Merged PDF</span>
              </a>
              <button
                onClick={handleReset}
                className="py-3 px-6 rounded-xl font-medium text-neutral-300 bg-[#1c1c27] hover:bg-[#252535] border border-[#2e2e3f] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Merge More Files</span>
              </button>
            </div>
          </div>

          {/* Continue to... suggestions */}
          <ContinueToSuggestions
            onSelectTool={(tool, f) => onNavigateToTool ? onNavigateToTool(tool, f) : onBack()}
            currentPdfFile={mergedFile}
            onSeeMore={onBack}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {pdfFiles.length === 0 ? (
            /* Upload box */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-[#2f2f40] hover:border-[#ff6b00] bg-[#12121a]/80 hover:bg-[#151522] p-12 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[350px]"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFiles(e.target.files)}
                multiple
                accept="application/pdf"
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] group-hover:scale-110 group-hover:bg-[#ff6b00]/20 transition-all mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">
                Drag & drop multiple PDF files here
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mb-6">
                Combine two or more PDF documents into one. Select them in the order you wish or rearrange them.
              </p>
              <span className="px-5 py-2.5 rounded-lg text-xs font-bold text-black bg-[#ff851a] group-hover:bg-[#ff9933] transition-colors">
                Select PDF Files
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">
                  {pdfFiles.length} PDF Files queued for merge
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#191924] hover:bg-[#222232] border border-[#2b2b3d] text-xs font-semibold text-[#ff851a] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add More
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFiles(e.target.files)}
                    multiple
                    accept="application/pdf"
                    className="hidden"
                  />
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-[#191924] hover:bg-red-500/10 border border-[#2b2b3d] hover:border-red-500/40 text-xs font-semibold text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Optional Active File Preview Inspector */}
              {selectedPreviewFile && (
                <div className="mb-4">
                  <PdfDocumentPreview
                    file={selectedPreviewFile}
                    onReplaceFile={() => setSelectedPreviewFile(null)}
                    title={`Selected Preview: ${selectedPreviewFile.name}`}
                  />
                </div>
              )}

              {/* PDF List */}
              <div className="space-y-2.5">
                {pdfFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl bg-[#12121a] border transition-colors ${
                      selectedPreviewFile?.name === file.name
                        ? 'border-[#ff5722] bg-[#161622]'
                        : 'border-[#222230] hover:border-[#ff5722]/40'
                    }`}
                  >
                    <div 
                      onClick={() => setSelectedPreviewFile(file.file)}
                      className="flex items-center gap-3 truncate cursor-pointer flex-1"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#ff5722]/10 border border-[#ff5722]/30 flex items-center justify-center text-[#ff5722] shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-white truncate hover:text-[#ff5722] transition-colors">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                          <span>{file.sizeKb} KB</span>
                          <span>·</span>
                          <span className="text-[#ff5722]">{file.pageCount} Pages</span>
                          <span>·</span>
                          <span className="text-neutral-500 hover:text-white">Click to preview</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <button
                        onClick={() => setSelectedPreviewFile(file.file)}
                        title="Inspect Document Pages"
                        className="p-1.5 rounded-lg bg-[#1a1a26] hover:bg-[#ff5722]/20 text-neutral-300 hover:text-[#ff5722] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveFile(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg bg-[#1a1a26] hover:bg-[#ff5722]/20 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 hover:text-[#ff5722] cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveFile(index, 'down')}
                        disabled={index === pdfFiles.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg bg-[#1a1a26] hover:bg-[#ff5722]/20 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 hover:text-[#ff5722] cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteFile(index)}
                        title="Remove file"
                        className="p-1.5 rounded-lg bg-[#1a1a26] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 cursor-pointer ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="p-4 rounded-xl bg-[#14141d] border border-[#252535] flex items-center justify-between mt-6">
                <span className="text-xs text-neutral-400">
                  Total combined pages: <strong className="text-white font-mono">{pdfFiles.reduce((acc, f) => acc + f.pageCount, 0)}</strong>
                </span>

                <button
                  onClick={handleMerge}
                  disabled={pdfFiles.length < 2 || isProcessing}
                  className="py-2.5 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all cursor-pointer text-xs sm:text-sm flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Merging Documents...</span>
                    </>
                  ) : (
                    <span>Merge PDFs</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
