import React from 'react';
import { 
  Minimize2, 
  Layers, 
  Scissors, 
  Stamp, 
  RotateCw, 
  ShieldCheck, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ActiveView } from '../../types';

interface ContinueToSuggestionsProps {
  onSelectTool: (tool: ActiveView, file?: File) => void;
  currentPdfFile?: File | null;
  onSeeMore?: () => void;
  className?: string;
}

export const ContinueToSuggestions: React.FC<ContinueToSuggestionsProps> = ({
  onSelectTool,
  currentPdfFile,
  onSeeMore,
  className = "",
}) => {
  const suggestions: Array<{
    id: ActiveView;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    bgColor: string;
  }> = [
    {
      id: 'compress-pdf',
      title: 'Compress PDF',
      icon: Minimize2,
      accentColor: 'text-[#10b981]',
      bgColor: 'bg-[#10b981]/10 border-[#10b981]/30',
    },
    {
      id: 'merge-pdf',
      title: 'Merge PDF',
      icon: Layers,
      accentColor: 'text-[#ff5722]',
      bgColor: 'bg-[#ff5722]/10 border-[#ff5722]/30',
    },
    {
      id: 'split-pdf',
      title: 'Split PDF',
      icon: Scissors,
      accentColor: 'text-[#ff851a]',
      bgColor: 'bg-[#ff851a]/10 border-[#ff851a]/30',
    },
    {
      id: 'watermark-pdf',
      title: 'Add watermark',
      icon: Stamp,
      accentColor: 'text-[#a855f7]',
      bgColor: 'bg-[#a855f7]/10 border-[#a855f7]/30',
    },
    {
      id: 'rotate-pdf',
      title: 'Rotate PDF',
      icon: RotateCw,
      accentColor: 'text-[#ec4899]',
      bgColor: 'bg-[#ec4899]/10 border-[#ec4899]/30',
    },
    {
      id: 'protect-pdf',
      title: 'Protect PDF',
      icon: ShieldCheck,
      accentColor: 'text-[#3b82f6]',
      bgColor: 'bg-[#3b82f6]/10 border-[#3b82f6]/30',
    },
  ];

  return (
    <div className={`w-full max-w-3xl lg:max-w-4xl mx-auto rounded-2xl bg-[#121218] border border-[#232332] p-6 sm:p-7 shadow-xl ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ff5722]" />
          <h3 className="text-sm font-bold text-white font-display">
            Continue to...
          </h3>
        </div>
        {currentPdfFile && (
          <span className="text-[11px] font-mono text-neutral-400">
            Chain output to next tool
          </span>
        )}
      </div>

      {/* Grid of suggestions (Matches user screenshot: 3 columns on tablet/desktop, 1-2 on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {suggestions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTool(item.id, currentPdfFile || undefined)}
              className="group flex items-center justify-between p-3 rounded-xl bg-[#171722] hover:bg-[#1f1f2e] border border-[#262638] hover:border-[#ff5722]/50 transition-all duration-200 cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${item.bgColor}`}>
                  <Icon className={`w-4 h-4 ${item.accentColor}`} />
                </div>
                <span className="text-xs font-semibold text-neutral-200 group-hover:text-white truncate">
                  {item.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-[#ff5722] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </button>
          );
        })}
      </div>

      {/* See more link */}
      {onSeeMore && (
        <div className="mt-4 pt-3 border-t border-[#1e1e2c] flex justify-end">
          <button
            onClick={onSeeMore}
            className="text-xs font-semibold text-neutral-400 hover:text-[#ff5722] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>See more tools</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
