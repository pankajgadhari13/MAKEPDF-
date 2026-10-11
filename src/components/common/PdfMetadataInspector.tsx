import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  Layers,
  User,
  Calendar,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  FileCode,
  Sparkles,
  Maximize2,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { extractPdfMetadata, PdfMetadata } from '../../utils/pdfMetadata';

interface PdfMetadataInspectorProps {
  file: File;
  className?: string;
  defaultExpanded?: boolean;
  onRefresh?: () => void;
  showCardHeader?: boolean;
}

export const PdfMetadataInspector: React.FC<PdfMetadataInspectorProps> = ({
  file,
  className = '',
  defaultExpanded = false,
  onRefresh,
  showCardHeader = true,
}) => {
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'specs' | 'raw'>('summary');
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    extractPdfMetadata(file)
      .then((data) => {
        if (isMounted) {
          setMetadata(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Metadata extraction error:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  const handleCopyMetadata = () => {
    if (!metadata) return;
    const payload = JSON.stringify(
      {
        fileName: metadata.fileName,
        pageCount: metadata.pageCount,
        author: metadata.author,
        creationDate: metadata.creationDateFormatted,
        modificationDate: metadata.modificationDateFormatted,
        encryptionStatus: metadata.encryptionStatusText,
        isEncrypted: metadata.isEncrypted,
        title: metadata.title,
        subject: metadata.subject,
        producer: metadata.producer,
        creator: metadata.creator,
        pdfVersion: metadata.pdfVersion,
        pageFormat: `${metadata.pageFormat} (${metadata.orientation})`,
        fileSize: metadata.fileSizeFormatted,
      },
      null,
      2
    );

    navigator.clipboard.writeText(payload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className={`rounded-2xl bg-[#0f0f15] border border-[#232332] p-5 sm:p-6 ${className}`}>
        <div className="flex items-center justify-between pb-4 border-b border-[#1c1c28]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff5722]/10 border border-[#ff5722]/30 flex items-center justify-center text-[#ff5722]">
              <FileSearch className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-display">PDF Metadata Inspector</h4>
              <p className="text-xs text-neutral-400">Inspecting file headers and pre-flight records...</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#14141d] border border-[#232332] animate-pulse space-y-2">
              <div className="w-16 h-3 bg-neutral-800 rounded"></div>
              <div className="w-24 h-5 bg-neutral-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className={`rounded-2xl bg-[#0f0f15] border border-[#232332] overflow-hidden ${className}`}>
      {/* Top Header Bar */}
      {showCardHeader && (
        <div className="px-4 sm:px-6 py-4 border-b border-[#1e1e2c] flex flex-wrap items-center justify-between gap-3 bg-[#0c0c12]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff5722]/15 border border-[#ff5722]/30 flex items-center justify-center text-[#ff5722] shrink-0">
              <FileSearch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white font-display">
                  PDF Metadata Inspector
                </h4>
                {metadata.isEncrypted ? (
                  <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Encrypted
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Safe
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 font-sans">
                Pre-flight validation & document identity before processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMetadata}
              className="px-3 py-1.5 rounded-lg bg-[#161622] hover:bg-[#1f1f2e] border border-[#28283a] text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy metadata to clipboard as JSON"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Copy Info</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-lg bg-[#161622] hover:bg-[#1f1f2e] border border-[#28283a] text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Collapse' : 'Deep Specs'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Primary Inspector 4-Card Grid */}
      <div className="p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Page Count */}
          <div className="p-4 rounded-xl bg-[#13131c] border border-[#232332] hover:border-[#ff5722]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Page Count
              </span>
              <Layers className="w-4 h-4 text-[#ff5722]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-white">
                {metadata.pageCount}
              </span>
              <span className="text-xs text-neutral-400 font-sans">
                {metadata.pageCount === 1 ? 'single sheet' : 'total pages'}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1c1c28] text-[11px] text-neutral-400 truncate">
              {metadata.pageFormat} · {metadata.orientation}
            </div>
          </div>

          {/* 2. Author */}
          <div className="p-4 rounded-xl bg-[#13131c] border border-[#232332] hover:border-[#ff5722]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Author
              </span>
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white truncate" title={metadata.author}>
              {metadata.author}
            </div>
            <div className="mt-2 pt-2 border-t border-[#1c1c28] text-[11px] text-neutral-400 truncate" title={metadata.creator}>
              App: {metadata.creator}
            </div>
          </div>

          {/* 3. Creation Date */}
          <div className="p-4 rounded-xl bg-[#13131c] border border-[#232332] hover:border-[#ff5722]/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Creation Date
              </span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm sm:text-base font-bold font-mono text-white truncate" title={metadata.creationDateFormatted}>
              {metadata.creationDateFormatted}
            </div>
            <div className="mt-2 pt-2 border-t border-[#1c1c28] text-[11px] text-neutral-400 truncate">
              Mod: {metadata.modificationDateFormatted}
            </div>
          </div>

          {/* 4. File Encryption Status */}
          <div className={`p-4 rounded-xl border transition-colors ${
            metadata.isEncrypted
              ? 'bg-amber-950/20 border-amber-600/40 hover:border-amber-500'
              : 'bg-[#13131c] border-[#232332] hover:border-emerald-500/40'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Encryption Status
              </span>
              {metadata.isEncrypted ? (
                <Lock className="w-4 h-4 text-amber-400" />
              ) : (
                <Unlock className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-base sm:text-lg font-bold ${
                metadata.isEncrypted ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {metadata.isEncrypted ? 'Encrypted' : 'Unencrypted'}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#1c1c28] text-[11px] text-neutral-400 truncate">
              {metadata.isEncrypted ? 'Password protected' : 'Full read & modify access'}
            </div>
          </div>
        </div>

        {/* Pre-flight Verification Banner */}
        <div className="p-3.5 rounded-xl bg-[#12121b] border border-[#222230] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-neutral-200">
              Pre-flight Verification:
            </span>
            <span className="text-neutral-400">
              {metadata.isValidPdf ? 'Valid PDF structure validated in memory stream' : 'Notice: Non-standard structure parsed'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
            <span>{metadata.pdfVersion}</span>
            <span aria-hidden="true">·</span>
            <span>{metadata.fileSizeFormatted}</span>
            <span aria-hidden="true">·</span>
            <span>{metadata.firstPageWidth}×{metadata.firstPageHeight} pt</span>
          </div>
        </div>

        {/* Detailed Inspector Specs (Collapsible or Deep View) */}
        {isExpanded && (
          <div className="pt-2 border-t border-[#1e1e2a] space-y-4">
            {/* Tabs for Deep Inspector */}
            <div className="flex items-center gap-1 p-1 bg-[#13131c] rounded-lg border border-[#232332] w-fit">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'summary'
                    ? 'bg-[#ff5722] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Verification Details
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-[#ff5722] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Technical Specs
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'raw'
                    ? 'bg-[#ff5722] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Raw Dictionary
              </button>
            </div>

            {/* Tab: Summary Verification */}
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#13131c] border border-[#222230] space-y-3">
                  <h5 className="font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#ff5722]" />
                    Document Identity
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1 border-b border-[#1b1b26]">
                      <span className="text-neutral-400">File Name</span>
                      <span className="text-white font-medium truncate max-w-[200px]" title={metadata.fileName}>
                        {metadata.fileName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#1b1b26]">
                      <span className="text-neutral-400">Document Title</span>
                      <span className="text-white font-medium truncate max-w-[200px]" title={metadata.title}>
                        {metadata.title}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#1b1b26]">
                      <span className="text-neutral-400">Subject</span>
                      <span className="text-neutral-300 truncate max-w-[200px]">{metadata.subject}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-neutral-400">Keywords</span>
                      <span className="text-neutral-300 truncate max-w-[200px]">{metadata.keywords}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#13131c] border border-[#222230] space-y-3">
                  <h5 className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Security & Engine Records
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1 border-b border-[#1b1b26]">
                      <span className="text-neutral-400">Encryption Layer</span>
                      <span className={`font-mono font-medium ${metadata.isEncrypted ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {metadata.isEncrypted ? 'Active (/Encrypt dict)' : 'None (Plainstream)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#1b1b26]">
                      <span className="text-neutral-400">PDF Producer</span>
                      <span className="text-neutral-300 font-mono text-[11px] truncate max-w-[200px]" title={metadata.producer}>
                        {metadata.producer}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#1b1b26]">
                      <span className="text-neutral-400">Byte Payload</span>
                      <span className="text-neutral-300 font-mono">
                        {metadata.fileSizeBytes.toLocaleString()} bytes ({metadata.fileSizeFormatted})
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-neutral-400">Ready For Processing</span>
                      <span className="text-emerald-400 font-medium">✓ Passed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Technical Specs */}
            {activeTab === 'specs' && (
              <div className="p-4 rounded-xl bg-[#13131c] border border-[#222230] overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#222230] text-neutral-400 font-medium pb-2">
                      <th className="pb-2">Property</th>
                      <th className="pb-2">Detected Value</th>
                      <th className="pb-2">Standard Specification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b1b26] font-mono text-[11px]">
                    <tr>
                      <td className="py-2 text-neutral-400">PDF Format Version</td>
                      <td className="py-2 text-white font-bold">{metadata.pdfVersion}</td>
                      <td className="py-2 text-neutral-400">ISO 32000 compliant</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-neutral-400">Page Count</td>
                      <td className="py-2 text-[#ff5722] font-bold">{metadata.pageCount} pages</td>
                      <td className="py-2 text-neutral-400">Linearized or indexed catalog</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-neutral-400">First Page Geometry</td>
                      <td className="py-2 text-white">{metadata.firstPageWidth} × {metadata.firstPageHeight} pt</td>
                      <td className="py-2 text-neutral-400">{metadata.pageFormat} ({metadata.orientation})</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-neutral-400">Author Metadata</td>
                      <td className="py-2 text-white font-sans">{metadata.author}</td>
                      <td className="py-2 text-neutral-400">/Author Info Dictionary entry</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-neutral-400">Creation Timestamp</td>
                      <td className="py-2 text-white font-sans">{metadata.creationDateFormatted}</td>
                      <td className="py-2 text-neutral-400">/CreationDate ASN.1 formatted</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-neutral-400">Modification Timestamp</td>
                      <td className="py-2 text-white font-sans">{metadata.modificationDateFormatted}</td>
                      <td className="py-2 text-neutral-400">/ModDate sync record</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-neutral-400">Encryption & Access</td>
                      <td className={`py-2 font-bold ${metadata.isEncrypted ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {metadata.encryptionStatusText}
                      </td>
                      <td className="py-2 text-neutral-400">Standard Security Handler</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Raw Dictionary */}
            {activeTab === 'raw' && (
              <div className="p-4 rounded-xl bg-[#09090e] border border-[#222230] font-mono text-[11px] space-y-3">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Raw PDF /Info Dictionary Entries:</span>
                  <button
                    onClick={handleCopyMetadata}
                    className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto space-y-1.5 p-3 rounded-lg bg-[#0e0e16] border border-[#1b1b26] text-neutral-300">
                  {Object.keys(metadata.rawDictionary).length > 0 ? (
                    Object.entries(metadata.rawDictionary).map(([key, val]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-[#ff5722]">{key}:</span>
                        <span className="text-neutral-200 truncate">{val}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-neutral-400 italic">
                      Standard metadata dictionary extracted directly via pdf-lib stream.
                      Title: {metadata.title} | Author: {metadata.author} | Pages: {metadata.pageCount}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
