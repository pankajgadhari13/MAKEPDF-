import React, { useState } from 'react';
import { ProcessedItem } from '../types';
import { FileText, Download, Trash2, Search, ArrowLeft } from 'lucide-react';

interface HistoryProps {
  history: ProcessedItem[];
  onBack: () => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

export const History: React.FC<HistoryProps> = ({
  history,
  onBack,
  onDeleteItem,
  onClearHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = history.filter((item) =>
    item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tool.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f1f2b]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-[#14141d] hover:bg-[#1f1f2b] border border-[#262635] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Processing History</h1>
            <p className="text-xs text-neutral-400">Complete audit trail of all generated files in this session.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search filename or tool..."
              className="bg-[#12121a] border border-[#222230] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#ff6b00] w-56"
            />
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-3 py-2 rounded-xl bg-[#1a1a24] hover:bg-red-500/10 border border-[#282838] hover:border-red-500/30 text-xs text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              Clear Log
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-[#12121a] border border-[#222230] overflow-hidden">
        {history.length === 0 ? (
          <div className="py-16 px-6 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] mx-auto shadow-[0_0_20px_rgba(255,107,0,0.15)]">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">No PDF Operations Yet</h3>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Your history is recorded in real-time. Whenever you compress, merge, split, rotate, convert, or protect PDFs with any tool, your real processed documents and download links will be saved here automatically.
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Explore Tools & Start Processing</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0b0f] text-neutral-400 border-b border-[#1f1f2b] font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">OUTPUT FILENAME</th>
                  <th className="py-3.5 px-4 font-semibold">UTILITY USED</th>
                  <th className="py-3.5 px-4 font-semibold">TIMESTAMP</th>
                  <th className="py-3.5 px-4 font-semibold">SIZE</th>
                  <th className="py-3.5 px-4 font-semibold">STATUS</th>
                  <th className="py-3.5 px-4 text-right font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c28]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-500">
                      No items match your search "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#161622] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#ff851a] shrink-0" />
                        <span className="truncate max-w-[240px]" title={item.filename}>{item.filename}</span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-300 font-medium">
                        {item.tool}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400 font-mono tabular-nums">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-300 font-mono tabular-nums">
                        {item.size}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.downloadUrl && (
                            <a
                              href={item.downloadUrl}
                              download={item.filename}
                              title="Download PDF"
                              className="p-1.5 rounded-lg bg-[#1e1e2c] hover:bg-[#ff6b00]/20 text-neutral-300 hover:text-[#ff851a] transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            title="Delete from log"
                            className="p-1.5 rounded-lg bg-[#1e1e2c] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
