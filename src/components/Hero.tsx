import React, { useRef } from 'react';
import { ActiveView } from '../types';
import { 
  ArrowUp, 
  Image, 
  Layers, 
  Scissors, 
  Minimize2, 
  FileImage, 
  RotateCw, 
  Stamp, 
  Lock 
} from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface HeroProps {
  onNavigate: (view: ActiveView) => void;
  onFilesSelected?: (files: FileList) => void;
  lang?: Language;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, onFilesSelected, lang = 'en' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const quickTools: { id: ActiveView; label: string; icon: any; badge?: string }[] = [
    { id: 'jpg-to-pdf', label: t.hero.quickTools.jpgToPdf, icon: Image, badge: 'Active' },
    { id: 'merge-pdf', label: t.hero.quickTools.mergePdf, icon: Layers, badge: 'Popular' },
    { id: 'compress-pdf', label: t.hero.quickTools.compressPdf, icon: Minimize2, badge: 'Fast' },
    { id: 'split-pdf', label: t.hero.quickTools.splitPdf, icon: Scissors },
    { id: 'pdf-to-jpg', label: t.hero.quickTools.pdfToJpg, icon: FileImage },
    { id: 'rotate-pdf', label: t.hero.quickTools.rotatePdf, icon: RotateCw },
    { id: 'protect-pdf', label: t.hero.quickTools.protectPdf, icon: Lock, badge: 'Secure' },
    { id: 'watermark-pdf', label: t.hero.quickTools.watermark, icon: Stamp },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFilesSelected) {
        onFilesSelected(e.dataTransfer.files);
      } else {
        onNavigate('jpg-to-pdf');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onFilesSelected) {
        onFilesSelected(e.target.files);
      } else {
        onNavigate('jpg-to-pdf');
      }
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center py-6 sm:py-8 lg:py-10 overflow-hidden bg-[#0a0a0d] border-b border-[#181822]">
      
      {/* Hidden file input for direct upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 flex flex-col items-center">
        
        {/* Quick Tools Pills Switcher */}
        <div className="mb-3 sm:mb-5 overflow-x-auto pb-1 scrollbar-none no-scrollbar flex items-center justify-start md:justify-center gap-1.5 sm:gap-2 w-full">
          <span className="text-[11px] font-mono text-[#ff851a] uppercase font-bold shrink-0 hidden sm:inline mr-1">
            TOOLS:
          </span>
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === 'jpg-to-pdf';
            return (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#ff5722] text-white shadow-[0_0_15px_rgba(255,87,34,0.4)]'
                    : 'bg-[#14141e] hover:bg-[#1f1f2d] text-neutral-300 hover:text-white border border-[#232332]'
                }`}
                title={tool.label}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="inline text-xs">{tool.label}</span>
                {tool.badge && !isActive && (
                  <span className="hidden sm:inline text-[9px] px-1.5 py-0.2 rounded bg-[#ff5722]/15 text-[#ff851a] font-mono border border-[#ff5722]/20">
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hero Content: Centered, stretched, prominently filling the first fold */}
        <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-2.5 sm:space-y-3.5">
          
          {/* Top kicker badge */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#ff5722] uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]"></span>
            <span>{t.hero.startWithImage}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.85rem] font-extrabold text-white tracking-tight leading-[1.08] font-display">
            {t.hero.dropJpgTitle}{' '}
            <span className="text-[#ff5722]">
              {t.hero.rightHere}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* Stretched & Enlarged Dropzone Box - Filling the hero viewport cleanly */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full max-w-2xl sm:max-w-3xl rounded-2xl bg-[#0f0f14] border border-dashed border-[#ff5722]/50 hover:border-[#ff5722] py-8 sm:py-11 lg:py-14 px-6 sm:px-8 min-h-[250px] sm:min-h-[290px] lg:min-h-[320px] flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden mt-2"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 87, 34, 0.05) 1.5px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          >
            {/* Subtle diagonal micro stripe accent */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeating-linear-gradient(45deg,#fff,#fff_1px,transparent_1px,transparent_10px)]" />

            <div className="flex flex-col items-center justify-center space-y-2.5 sm:space-y-3.5 relative z-10 w-full max-w-lg">
              {/* Circular Orange Upload Button */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#ff5722] text-white flex items-center justify-center shadow-[0_0_24px_rgba(255,87,34,0.55)] group-hover:scale-110 group-hover:shadow-[0_0_32px_rgba(255,87,34,0.75)] transition-all">
                <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>

              {/* Drop prompt text */}
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white font-display pt-1">
                {t.hero.dragAndDrop}
              </h3>

              {/* Secondary prompt with highlighted link */}
              <p className="text-xs sm:text-sm text-neutral-400">
                {t.hero.orClickToBrowse}
              </p>

              {/* Format specs */}
              <span className="text-[11px] sm:text-xs font-mono text-neutral-400 pt-0.5">
                {t.hero.supportsImages}
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
