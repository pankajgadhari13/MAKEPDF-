import React from 'react';
import { 
  Home, 
  Layers, 
  History as HistoryIcon, 
  HelpCircle, 
  LogIn, 
  User as UserIcon
} from 'lucide-react';
import { ActiveView, UserState } from '../types';
import { Language } from '../utils/translations';
import { smoothScrollToTop } from '../utils/scrollHelper';

interface MobileBottomNavProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  user: UserState;
  onOpenAuth: (mode: 'login' | 'register') => void;
  lang?: Language;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  lang = 'en'
}) => {
  const isToolView = [
    'tools',
    'jpg-to-pdf',
    'merge-pdf',
    'split-pdf',
    'compress-pdf',
    'pdf-to-jpg',
    'rotate-pdf',
    'watermark-pdf',
    'protect-pdf',
    'inspect-pdf',
    'word-to-pdf'
  ].includes(currentView);

  const isHomeView = currentView === 'home';
  const isHistoryView = currentView === 'history';
  const isFaqView = currentView === 'faq';
  const isProfileView = currentView === 'dashboard' || currentView === 'admin';

  const handleHomeClick = () => {
    onNavigate('home');
    smoothScrollToTop();
  };

  const handleToolsClick = () => {
    if (isHomeView) {
      const el = document.getElementById('pdf-tools-directory');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    onNavigate('tools');
    smoothScrollToTop();
  };

  const handleHistoryClick = () => {
    onNavigate('history');
    smoothScrollToTop();
  };

  const handleFaqClick = () => {
    onNavigate('faq');
    smoothScrollToTop();
  };

  const handleAccountClick = () => {
    if (user.isLoggedIn) {
      onNavigate('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onOpenAuth('login');
    }
  };

  const tHome = lang === 'hi' ? 'होम' : 'Home';
  const tTools = lang === 'hi' ? 'टूल्स' : 'Tools';
  const tHistory = lang === 'hi' ? 'इतिहास' : 'History';
  const tFaq = lang === 'hi' ? 'सवाल / FAQ' : 'FAQ';
  const tAccount = user.isLoggedIn
    ? (user.name && user.name !== 'Guest' ? user.name.split(' ')[0] : (lang === 'hi' ? 'खाता' : 'Account'))
    : (lang === 'hi' ? 'लॉग इन' : 'Login');

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="mobile-bottom-nav fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-[#1f1f2e] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center px-1">
        
        {/* 1. Home Tab */}
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center h-full py-1 relative transition-colors cursor-pointer active:scale-95 ${
            isHomeView ? 'nav-active text-[#ff5722]' : 'nav-inactive text-neutral-400 hover:text-neutral-200'
          }`}
          aria-label={tHome}
        >
          {isHomeView && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ff5722] rounded-full shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
          )}
          <Home className={`w-5 h-5 transition-transform duration-200 ${isHomeView ? 'scale-110' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium tracking-tight ${isHomeView ? 'font-bold' : ''}`}>
            {tHome}
          </span>
        </button>

        {/* 2. Tools Tab */}
        <button
          onClick={handleToolsClick}
          className={`flex flex-col items-center justify-center h-full py-1 relative transition-colors cursor-pointer active:scale-95 ${
            isToolView ? 'nav-active text-[#ff5722]' : 'nav-inactive text-neutral-400 hover:text-neutral-200'
          }`}
          aria-label={tTools}
        >
          {isToolView && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ff5722] rounded-full shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
          )}
          <Layers className={`w-5 h-5 transition-transform duration-200 ${isToolView ? 'scale-110' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium tracking-tight ${isToolView ? 'font-bold' : ''}`}>
            {tTools}
          </span>
        </button>

        {/* 3. History Tab */}
        <button
          onClick={handleHistoryClick}
          className={`flex flex-col items-center justify-center h-full py-1 relative transition-colors cursor-pointer active:scale-95 ${
            isHistoryView ? 'nav-active text-[#ff5722]' : 'nav-inactive text-neutral-400 hover:text-neutral-200'
          }`}
          aria-label={tHistory}
        >
          {isHistoryView && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ff5722] rounded-full shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
          )}
          <HistoryIcon className={`w-5 h-5 transition-transform duration-200 ${isHistoryView ? 'scale-110' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium tracking-tight ${isHistoryView ? 'font-bold' : ''}`}>
            {tHistory}
          </span>
        </button>

        {/* 4. FAQ / Instructions Tab (Replaced Download) */}
        <button
          onClick={handleFaqClick}
          className={`flex flex-col items-center justify-center h-full py-1 relative transition-colors cursor-pointer active:scale-95 ${
            isFaqView ? 'nav-active text-[#ff5722]' : 'nav-inactive text-neutral-400 hover:text-[#ff5722]'
          }`}
          aria-label={tFaq}
          title="FAQ & Usage Instructions"
        >
          {isFaqView && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ff5722] rounded-full shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
          )}
          <HelpCircle className={`w-5 h-5 transition-transform duration-200 ${isFaqView ? 'scale-110' : ''}`} />
          <span className={`text-[10px] mt-1 font-medium tracking-tight ${isFaqView ? 'font-bold' : ''}`}>
            {tFaq}
          </span>
        </button>

        {/* 5. Account / Login Tab */}
        <button
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center h-full py-1 relative transition-colors cursor-pointer active:scale-95 ${
            isProfileView ? 'nav-active text-[#ff5722]' : 'nav-inactive text-neutral-400 hover:text-neutral-200'
          }`}
          aria-label={tAccount}
        >
          {isProfileView && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ff5722] rounded-full shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
          )}
          {user.isLoggedIn ? (
            <UserIcon className={`w-5 h-5 transition-transform duration-200 ${isProfileView ? 'scale-110' : ''}`} />
          ) : (
            <LogIn className={`w-5 h-5 transition-transform duration-200 ${isProfileView ? 'scale-110' : ''}`} />
          )}
          <span className={`text-[10px] mt-1 font-medium tracking-tight truncate max-w-[58px] ${isProfileView ? 'font-bold' : ''}`}>
            {tAccount}
          </span>
        </button>

      </div>
    </nav>
  );
};
