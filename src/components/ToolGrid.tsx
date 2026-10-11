import React, { useState } from 'react';
import { ActiveView } from '../types';
import { 
  Image, 
  Layers, 
  Scissors, 
  Minimize2, 
  FileImage, 
  RotateCw, 
  Stamp, 
  Lock, 
  Trash2, 
  ArrowRight,
  Search,
  Sparkles,
  FileSearch,
  FileText
} from 'lucide-react';
import { Language, translations } from '../utils/translations';

interface ToolGridProps {
  onSelectTool: (tool: ActiveView) => void;
  title?: string;
  subtitle?: string;
  lang?: Language;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ 
  onSelectTool,
  title,
  subtitle,
  lang = 'en'
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'convert' | 'organize' | 'security'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[lang];

  const displayTitle = title || t.toolGrid.title;
  const displaySubtitle = subtitle || t.toolGrid.subtitle;

  const tools = [
    {
      id: 'jpg-to-pdf' as ActiveView,
      number: '01',
      title: t.tools.jpgToPdf.title,
      desc: t.tools.jpgToPdf.desc,
      icon: Image,
      badge: 'Popular',
      category: 'convert',
    },
    {
      id: 'merge-pdf' as ActiveView,
      number: '02',
      title: t.tools.mergePdf.title,
      desc: t.tools.mergePdf.desc,
      icon: Layers,
      badge: 'Fast',
      category: 'organize',
    },
    {
      id: 'split-pdf' as ActiveView,
      number: '03',
      title: t.tools.splitPdf.title,
      desc: t.tools.splitPdf.desc,
      icon: Scissors,
      badge: 'Precise',
      category: 'organize',
    },
    {
      id: 'compress-pdf' as ActiveView,
      number: '04',
      title: t.tools.compressPdf.title,
      desc: t.tools.compressPdf.desc,
      icon: Minimize2,
      badge: 'Smart',
      category: 'security',
    },
    {
      id: 'pdf-to-jpg' as ActiveView,
      number: '05',
      title: t.tools.pdfToJpg.title,
      desc: t.tools.pdfToJpg.desc,
      icon: FileImage,
      badge: 'HD Export',
      category: 'convert',
    },
    {
      id: 'rotate-pdf' as ActiveView,
      number: '06',
      title: t.tools.rotatePdf.title,
      desc: t.tools.rotatePdf.desc,
      icon: RotateCw,
      badge: 'Interactive',
      category: 'organize',
    },
    {
      id: 'watermark-pdf' as ActiveView,
      number: '07',
      title: t.tools.watermarkPdf.title,
      desc: t.tools.watermarkPdf.desc,
      icon: Stamp,
      badge: 'Security',
      category: 'security',
    },
    {
      id: 'protect-pdf' as ActiveView,
      number: '08',
      title: t.tools.protectPdf.title,
      desc: t.tools.protectPdf.desc,
      icon: Lock,
      badge: 'Encrypted',
      category: 'security',
    },
    {
      id: 'inspect-pdf' as ActiveView,
      number: '09',
      title: t.tools.inspectPdf.title,
      desc: t.tools.inspectPdf.desc,
      icon: FileSearch,
      badge: 'Inspector',
      category: 'security',
    },
    {
      id: 'word-to-pdf' as ActiveView,
      number: '10',
      title: t.tools.wordToPdf.title,
      desc: t.tools.wordToPdf.desc,
      icon: FileText,
      badge: 'DOCX',
      category: 'convert',
    },
  ];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="pdf-tools-directory" className="py-12 sm:py-16 lg:py-20 bg-[#0c0c11] border-t border-[#1a1a24]">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff851a] block mb-2 font-mono">
            SUITE ARCHITECTURE • 10 ACTIVE TOOLS
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            {displayTitle}
          </h2>
          <p className="mt-2.5 text-neutral-400 text-xs sm:text-base lg:text-lg">
            {displaySubtitle}
          </p>

          {/* Mobile & Tablet Search Bar + Filter Tabs */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.toolGrid.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#14141e] border border-[#262638] focus:border-[#ff5722] text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Category Tabs: Touch-Friendly for Mobile & Tablet */}
          <div className="mt-4 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
            {[
              { id: 'all', label: t.toolGrid.categories.all },
              { id: 'convert', label: t.toolGrid.categories.convert },
              { id: 'organize', label: t.toolGrid.categories.organize },
              { id: 'security', label: t.toolGrid.categories.security },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#ff5722] text-white shadow-[0_0_15px_rgba(255,87,34,0.4)]'
                    : 'bg-[#151520] text-neutral-400 hover:text-white hover:bg-[#1f1f2d] border border-[#222232]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid: Optimized for Mobile (1 col), Tablet (2 col), Laptop (3 col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
          {filteredTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <div
                key={tool.title}
                onClick={() => onSelectTool(tool.id)}
                className="tool-card group relative rounded-2xl bg-[#12121a] hover:bg-[#161622] border border-[#232332] hover:border-[#ff5722] p-4.5 sm:p-6 flex flex-col justify-between transition-colors duration-200 cursor-pointer overflow-hidden"
              >
                <div className="relative z-10">
                  {/* Top row: Icon + Number + Badge */}
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] group-hover:border-[#ff5722] transition-colors">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-400">
                        {tool.number}
                      </span>
                      <span className="text-[10px] font-semibold text-[#ff851a] bg-[#ff6b00]/10 px-2 py-0.5 rounded border border-[#ff6b00]/20 font-mono group-hover:border-[#ff5722]/40 transition-colors">
                        {tool.badge}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#ff851a] transition-colors mb-1.5 sm:mb-2 font-display">
                    {tool.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                {/* Bottom Action Trigger */}
                <div className="relative z-10 mt-5 pt-3.5 border-t border-[#1e1e2b] group-hover:border-[#ff5722]/30 flex items-center justify-between text-xs font-semibold text-[#ff851a] transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff5722]" />
                    <span>{t.toolGrid.openTool}</span>
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#1e1e2c] group-hover:bg-[#ff5722] group-hover:text-black group-hover:shadow-[0_0_12px_rgba(255,87,34,0.6)] flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if search returns no matches */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-[#12121a] border border-[#232332]">
            <p className="text-neutral-400 text-sm">{t.toolGrid.noToolsFound}</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="mt-3 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#ff5722] text-white cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
