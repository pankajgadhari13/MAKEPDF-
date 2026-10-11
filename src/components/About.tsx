import React from 'react';
import { ShieldCheck, Cpu, Lock, Zap } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-mono font-bold text-[#ff851a] uppercase tracking-widest block">
          ABOUT MAKEPDF
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
          Powerful PDF Tools. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff851a] to-[#ff4500]">
            Made Simple.
          </span>
        </h1>
        <p className="text-neutral-300 text-sm sm:text-base max-w-xl mx-auto">
          MAKEPDF was born from a desire to eliminate bloated, clunky, ad-infested PDF converter portals and replace them with a hyper-fast, security-first document engine.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#232332]">
          <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2 font-display">100% Client-Side Privacy</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your confidential tax files, invoices, contracts, and IDs never leak to external ad brokers. Processing happens directly in memory with instant zero-trace disposal.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#232332]">
          <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2 font-display">Python & PyMuPDF Core</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Architected around modern Python 3.11+, Flask blueprints, PyMuPDF, and pypdf with support for cloud microservice deployment and local offline execution.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#232332]">
          <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2 font-display">Sub-Second Processing</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            No endless queues or artificial countdown timers. Operations start and finish within milliseconds without degradation in text vector sharpness.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#232332]">
          <div className="w-10 h-10 rounded-xl bg-[#ff6b00]/10 border border-[#ff6b00]/30 flex items-center justify-center text-[#ff851a] mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white mb-2 font-display">Original Futuristic Design</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Crafted with a signature Orange & Black aesthetic, obsidian glass components, and seamless responsive behavior across mobile, tablet, and desktop viewports.
          </p>
        </div>
      </div>
    </div>
  );
};
