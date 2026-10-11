import React from 'react';
import { Download } from 'lucide-react';
import { ActiveView, UserState } from '../types';
import { Language, translations } from '../utils/translations';
import { ADMIN_CREDENTIALS } from '../utils/analyticsStore';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
  lang?: Language;
  user?: UserState;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, lang = 'en', user }) => {
  const t = translations[lang];
  const isSuperAdmin = !!(user?.isLoggedIn && (user.isAdmin || user.email?.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()));

  return (
    <footer className="mt-auto bg-[#0a0a0e] border-t border-[#1b1b26] py-10">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand Lockup */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-lg font-bold text-white font-display">
              MAKE<span className="text-[#ff6b00]">PDF</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {t.footer.tagline}
          </p>
        </div>

        {/* Clean Text Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-neutral-400">
          <button onClick={() => onNavigate('tools')} className="hover:text-white transition-colors cursor-pointer">
            {t.footer.tools}
          </button>
          <button onClick={() => onNavigate('history')} className="hover:text-white transition-colors cursor-pointer">
            {lang === 'hi' ? 'इतिहास' : 'History'}
          </button>
          <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors cursor-pointer">
            {t.footer.pricing}
          </button>
          <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
            {t.footer.about}
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('btn-click-to-download');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                (el as HTMLButtonElement).click();
              }
            }} 
            className="text-[#ff851a] hover:text-[#ff5722] transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            title="Install safe mobile app"
          >
            <Download className="w-3.5 h-3.5 animate-pulse" />
            <span>Install App</span>
          </button>
          {isSuperAdmin && (
            <button onClick={() => onNavigate('admin')} className="text-neutral-400 hover:text-[#ff851a] transition-colors cursor-pointer flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5722]" />
              {t.footer.admin}
            </button>
          )}
        </div>

        {/* Right Corner: Copyright & Creator Credit */}
        <div className="flex flex-col items-center md:items-end gap-1 text-xs font-mono">
          <div className="text-neutral-500">
            {t.footer.copyright}
          </div>
          <div className="text-[11px] text-neutral-400">
            {t.footer.createdBy} <span className="text-[#ff851a] font-medium">Pankaj Gadhari</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
