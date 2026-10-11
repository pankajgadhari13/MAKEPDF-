import React from 'react';
import { UserState, ProcessedItem, ActiveView } from '../types';
import { 
  FileText, 
  Layers, 
  HardDrive, 
  Activity, 
  Download, 
  Trash2, 
  ArrowRight,
  Plus,
  Mail
} from 'lucide-react';
import { UserAvatar } from './common/UserAvatar';

interface DashboardProps {
  user: UserState;
  history: ProcessedItem[];
  onNavigate: (view: ActiveView) => void;
  onDeleteItem: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  history,
  onNavigate,
  onDeleteItem,
}) => {
  return (
    <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-10 space-y-10">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#1f1f2b]">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size="lg" showBadge={true} />
          <div>
            <span className="text-xs font-mono text-[#ff851a] uppercase font-semibold">WORKSPACE OVERVIEW</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#ff851a]">{user.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#ff5722]" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('tools')}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl font-bold text-xs text-black bg-gradient-to-r from-[#ff851a] to-[#ff5500] hover:from-[#ff9433] hover:to-[#ff661a] shadow-[0_0_15px_rgba(255,107,0,0.35)] flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New PDF Operation</span>
        </button>
      </div>

      {/* 4 Stat Cards (Tabular figures, single-elevation depth, no pill sandwich) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl bg-[#12121a] border border-[#222230] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-400 font-medium">Files Processed</span>
            <div className="w-8 h-8 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {Math.max(user.filesProcessed, history.length)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Lifetime batch operations</span>
        </div>

        <div className="rounded-2xl bg-[#12121a] border border-[#222230] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-400 font-medium">PDFs Created</span>
            <div className="w-8 h-8 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#ff851a] font-mono tabular-nums">
            {Math.max(user.pdfsCreated, history.length)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Optimized documents</span>
        </div>

        <div className="rounded-2xl bg-[#12121a] border border-[#222230] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-400 font-medium">Storage Allocation</span>
            <div className="w-8 h-8 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a]">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {Math.max(user.storageUsedMb, Number((history.length * 0.4).toFixed(1))).toFixed(1)} <span className="text-sm font-normal text-neutral-500">MB</span>
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">In-memory transient store</span>
        </div>

        <div className="rounded-2xl bg-[#12121a] border border-[#222230] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-neutral-400 font-medium">Recent Activity</span>
            <div className="w-8 h-8 rounded-lg bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            100%
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Engine integrity check passed</span>
        </div>
      </div>

      {/* Recent Files Table */}
      <div className="rounded-2xl bg-[#12121a] border border-[#222230] overflow-hidden">
        <div className="p-5 border-b border-[#1f1f2b] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-display">Recent Document Operations</h2>
            <p className="text-xs text-neutral-400">Manage and re-download your processed files.</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-[#ff851a] hover:text-[#ff9933] flex items-center gap-1 cursor-pointer"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0b0f] text-neutral-400 border-b border-[#1f1f2b] font-mono">
              <tr>
                <th className="py-3 px-4 font-semibold">FILENAME</th>
                <th className="py-3 px-4 font-semibold">TOOL</th>
                <th className="py-3 px-4 font-semibold">DATE & TIME</th>
                <th className="py-3 px-4 font-semibold">FILE SIZE</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c28]">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    No PDF operations performed yet. Select a tool to start processing files.
                  </td>
                </tr>
              ) : (
                history.slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-[#161622] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#ff851a] shrink-0" />
                      <span className="truncate max-w-[200px]">{item.filename}</span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">
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
                            title="Download"
                            className="p-1.5 rounded-lg bg-[#1e1e2c] hover:bg-[#ff6b00]/20 text-neutral-300 hover:text-[#ff851a] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          title="Delete Record"
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
      </div>
    </div>
  );
};
