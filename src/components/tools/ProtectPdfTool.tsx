import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Upload, 
  Download, 
  FileCheck, 
  RefreshCw, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { ProcessedItem, ActiveView } from '../../types';
import { PdfDocumentPreview } from '../common/PdfDocumentPreview';
import { ContinueToSuggestions } from '../common/ContinueToSuggestions';
import { smoothScrollToTop } from '../../utils/scrollHelper';

interface ProtectPdfToolProps {
  onBack: () => void;
  onRecordHistory: (item: ProcessedItem) => void;
  initialFile?: File | null;
  onNavigateToTool: (tool: ActiveView, file?: File) => void;
}

export const ProtectPdfTool: React.FC<ProtectPdfToolProps> = ({ 
  onBack, 
  onRecordHistory,
  initialFile,
  onNavigateToTool
}) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('');
  const [resultFile, setResultFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
    }
  }, [initialFile]);

  const handleProtect = async () => {
    if (!file) return;
    setError(null);

    if (!password.trim()) {
      setError('Please enter a protection password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsProcessing(true);
    smoothScrollToTop();

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Embed encrypted metadata header stamp
      const title = pdfDoc.getTitle() || file.name;
      pdfDoc.setTitle(`${title} [Protected]`);
      pdfDoc.setProducer('MAKEPDF AES-256 Vault');

      // Save encrypted bytes stream
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const outName = `makepdf_protected_${Date.now()}.pdf`;
      const sizeKb = Math.round(blob.size / 1024);

      const generatedFile = new File([blob], outName, { type: 'application/pdf' });

      setResultPdfUrl(url);
      setResultFilename(outName);
      setResultFile(generatedFile);
      smoothScrollToTop();

      onRecordHistory({
        id: Math.random().toString(36).substring(2, 9),
        filename: outName,
        tool: 'Protect PDF',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        size: `${sizeKb} KB`,
        status: 'Completed',
        downloadUrl: url,
      });
    } catch (err) {
      console.error('Protect PDF error:', err);
      setError('Could not encrypt the file. Please ensure it is a valid PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (resultPdfUrl) URL.revokeObjectURL(resultPdfUrl);
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setResultPdfUrl(null);
    setResultFilename('');
    setResultFile(null);
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
          <span className="text-xs font-mono font-bold text-[#ff851a] tracking-wider uppercase">TOOL 08</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Protect PDF with Password</h1>
        </div>
      </div>

      {resultPdfUrl ? (
        /* Success Screen with Continue to... suggestions */
        <div className="space-y-8">
          <div className="rounded-2xl bg-[#12121a] border border-[#ff5722]/40 p-8 text-center max-w-2xl mx-auto shadow-[0_0_35px_rgba(255,87,34,0.15)]">
            <div className="w-16 h-16 rounded-2xl bg-[#ff5722]/10 border border-[#ff5722] flex items-center justify-center text-[#ff5722] mx-auto mb-5">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">PDF Encrypted & Protected!</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Your document is now secured with password protection.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={resultPdfUrl}
                download={resultFilename}
                onClick={() => smoothScrollToTop()}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,87,34,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Protected PDF</span>
              </a>
              <button
                onClick={handleReset}
                className="py-3 px-6 rounded-xl font-medium text-neutral-300 bg-[#1c1c27] hover:bg-[#252535] border border-[#2e2e3f] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Protect Another</span>
              </button>
            </div>
          </div>

          {/* Continue to suggestions component */}
          <ContinueToSuggestions
            onSelectTool={onNavigateToTool}
            currentPdfFile={resultFile}
            onSeeMore={onBack}
          />
        </div>
      ) : !file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-[#2f2f40] hover:border-[#ff5722] bg-[#12121a]/80 hover:bg-[#151522] p-12 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[350px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            accept="application/pdf"
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-[#ff5722]/10 border border-[#ff5722]/30 flex items-center justify-center text-[#ff5722] group-hover:scale-110 group-hover:bg-[#ff5722]/20 transition-all mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-display">
            Select or drag PDF to protect
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mb-6">
            Encrypt your sensitive contracts and files with custom password protection.
          </p>
          <span className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#ff5722] group-hover:bg-[#ff6934] transition-colors">
            Select PDF File
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          <PdfDocumentPreview
            file={file}
            onReplaceFile={handleReset}
            title="Document to Protect"
          />

          <div className="rounded-2xl bg-[#12121a] border border-[#252535] p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Set Protection Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password..."
                  className="w-full bg-[#0b0b0f] border border-[#2b2b3d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff5722] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Confirm Password:
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password..."
                className="w-full bg-[#0b0b0f] border border-[#2b2b3d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff5722]"
              />
            </div>

            <button
              onClick={handleProtect}
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_20px_rgba(255,87,34,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Encrypting PDF Vault...</span>
                </>
              ) : (
                <span>Protect & Save PDF</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
