import React, { useState, useRef, useEffect } from 'react';
import { ActiveView, UserState } from '../types';
import { 
  ArrowRight, 
  Sun, 
  FileText, 
  Moon, 
  Menu, 
  MoreVertical,
  X, 
  ChevronDown, 
  LayoutDashboard, 
  History, 
  LogOut, 
  Mail, 
  ShieldAlert,
  Image,
  Layers,
  Scissors,
  Minimize2,
  FileImage,
  RotateCw,
  Stamp,
  Lock,
  Sparkles,
  FileSearch,
  Database
} from 'lucide-react';
import { UserAvatar } from './common/UserAvatar';
import { ADMIN_CREDENTIALS } from '../utils/analyticsStore';
import { getActiveFirebaseConfig } from '../firebase';
import { Language, translations } from '../utils/translations';

interface NavbarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  user: UserState;
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
  onLogout: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
  onOpenFirebaseConfig?: () => void;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  isLightMode,
  onToggleTheme,
  onOpenFirebaseConfig,
  lang = 'en',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeClick = () => {
    onNavigate('home');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (view: ActiveView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleSectionScroll = (id: string) => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    if (currentView !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#08080a]/95 backdrop-blur-md border-b border-[#17171e]">
      {/* Stretched for laptop & desktop viewing */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 h-16 flex items-center justify-between">
        
        {/* Left: MAKEPDF Logo + Divider + Monospace Tagline */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleHomeClick} 
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            {/* Orange Document Icon */}
            <div className="w-8 h-8 rounded-lg bg-[#ff5722] flex items-center justify-center shadow-[0_0_15px_rgba(255,87,34,0.4)] group-hover:shadow-[0_0_20px_rgba(255,87,34,0.6)] transition-all">
              <FileText className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            
            {/* MAKEPDF Wordmark */}
            <span className="text-xl font-extrabold tracking-tight text-white font-display">
              MAKE<span className="text-[#ff5722]">PDF</span>
            </span>
          </button>

          <span className="hidden sm:inline text-neutral-700 text-sm">|</span>
          <span className="hidden sm:inline font-mono text-[11px] text-neutral-400 tracking-wide">
            {t.nav.tagline}
          </span>
        </div>

        {/* Center: Navigation Links (Including "Home") */}
        <nav className="hidden md:flex items-center gap-3.5 lg:gap-6 xl:gap-8 text-xs lg:text-sm font-medium">
          <button
            onClick={handleHomeClick}
            className={`transition-colors cursor-pointer ${
              currentView === 'home'
                ? 'text-[#ff5722] font-semibold'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            {t.nav.home}
          </button>

          <button
            onClick={() => handleNavClick('tools')}
            className={`transition-colors cursor-pointer ${
              currentView === 'tools' || ['jpg-to-pdf', 'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'rotate-pdf', 'watermark-pdf', 'protect-pdf', 'inspect-pdf', 'word-to-pdf'].includes(currentView)
                ? 'text-[#ff5722] font-semibold'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            {t.nav.pdfTools}
          </button>

          <button
            onClick={() => handleNavClick('history')}
            className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'history' ? 'text-[#ff5722] font-semibold' : 'text-neutral-300 hover:text-white'
            }`}
          >
            <span>{t.nav.fileHistory}</span>
          </button>

          <button
            onClick={() => handleSectionScroll('how-it-works')}
            className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {t.nav.howItWorks}
          </button>

          <button
            onClick={() => handleNavClick('pricing')}
            className={`transition-colors cursor-pointer ${
              currentView === 'pricing' ? 'text-white font-semibold' : 'text-neutral-300 hover:text-white'
            }`}
          >
            {t.nav.pricing}
          </button>

          <button
            onClick={() => handleSectionScroll('faq')}
            className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {t.nav.faq}
          </button>
        </nav>

        {/* Right: Theme Toggle + Log in / User Profile DP + Get started CTA + Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Persistent Theme Toggle (Sun / Moon) - Icon only without text */}
          <button
            onClick={onToggleTheme}
            className={`flex items-center justify-center p-2 rounded-full border transition-all cursor-pointer shadow-xs shrink-0 group ${
              isLightMode
                ? 'bg-[#ff5722]/10 border-[#ff5722]/40 text-[#ea580c] hover:bg-[#ff5722]/20'
                : 'bg-[#14141e] border-[#272738] text-neutral-300 hover:text-white hover:border-[#ff5722]/50'
            }`}
            title={isLightMode ? 'Switch to High-Contrast Orange/Black Theme' : 'Switch to Clean Light Mode'}
            aria-label="Toggle theme mode"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300 ${
              isLightMode 
                ? 'bg-[#ff5722] text-white shadow-[0_0_8px_rgba(255,87,34,0.5)] rotate-180' 
                : 'bg-[#222234] text-[#ff851a] group-hover:bg-[#ff5722]/20'
            }`}>
              {isLightMode ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {/* User DP Circle or Login Button */}
          {user.isLoggedIn ? (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 sm:gap-2.5 p-1 pl-1.5 pr-2 sm:pr-2.5 rounded-full bg-[#13131c] hover:bg-[#1b1b26] border border-[#29293b] hover:border-[#ff5722]/60 transition-all cursor-pointer group shadow-sm shrink-0"
                aria-label="User profile menu"
              >
                {/* Small Circle with User's Mail DP */}
                <UserAvatar user={user} size="sm" showBadge={true} />
                
                <span className="hidden sm:inline text-xs font-semibold text-neutral-200 group-hover:text-white max-w-[110px] lg:max-w-[140px] truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
                
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-[#ff5722]' : ''}`} />
              </button>

              {/* User Dropdown Profile Card - Centered on mobile viewport, right-aligned on desktop */}
              {userMenuOpen && (
                <>
                  {/* Backdrop for mobile screen */}
                  <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 sm:hidden"
                    onClick={() => setUserMenuOpen(false)}
                  />

                  <div className="
                    fixed left-1/2 -translate-x-1/2 top-20 w-[calc(100vw-32px)] max-w-sm z-50
                    sm:translate-x-0 sm:left-auto sm:top-full sm:right-0 sm:mt-2 sm:w-72 sm:absolute
                    rounded-2xl bg-[#12121a] border border-[#2b2b3d] shadow-2xl p-4.5
                    animate-in fade-in zoom-in-95 sm:zoom-in-100 sm:slide-in-from-top-2 duration-150
                  ">
                    {/* Mobile Header with close button */}
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#20202e] sm:hidden">
                      <span className="text-xs font-semibold text-neutral-400">{t.nav.accountDetails}</span>
                      <button
                        onClick={() => setUserMenuOpen(false)}
                        className="p-1.5 rounded-lg bg-[#181824] hover:bg-[#202030] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        aria-label="Close account menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* User profile header - centered on mobile, inline on desktop */}
                    <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 pb-3 border-b border-[#20202e]">
                      <UserAvatar user={user} size="lg" showBadge={true} className="sm:hidden" />
                      <div className="hidden sm:block">
                        <UserAvatar user={user} size="md" showBadge={true} />
                      </div>
                      <div className="min-w-0 flex-1 w-full">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-xs text-neutral-400 truncate flex items-center justify-center sm:justify-start gap-1 mt-0.5" title={user.email}>
                          <Mail className="w-3 h-3 text-[#ff5722] shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Account stats */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-[#171722] border border-[#232332] text-center">
                      <div>
                        <p className="text-[10px] text-neutral-400 font-mono">{t.nav.converted}</p>
                        <p className="text-xs font-bold text-[#ff5722] font-mono">{user.filesProcessed} files</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 font-mono">{t.nav.storage}</p>
                        <p className="text-xs font-bold text-white font-mono">{user.storageUsedMb} MB</p>
                      </div>
                    </div>

                    {/* Navigation links */}
                    <div className="space-y-1">
                      <button
                        onClick={() => handleNavClick('dashboard')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer text-left"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#ff5722]" />
                        <span>{t.nav.userDashboard}</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('history')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer text-left"
                      >
                        <History className="w-4 h-4 text-emerald-400" />
                        <span>{t.nav.fileHistory}</span>
                      </button>
                      {/* ONLY show Admin Panel & Firebase Config when Admin is logged in */}
                      {user.isLoggedIn && (user.isAdmin || user.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) && (
                        <>
                          <button
                            onClick={() => handleNavClick('admin')}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer text-left group"
                          >
                            <div className="flex items-center gap-2.5">
                              <ShieldAlert className="w-4 h-4 text-[#ff5722]" />
                              <span>{t.nav.adminPanel}</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#ff851a] bg-[#ff5722]/15 px-1.5 py-0.5 rounded font-bold border border-[#ff5722]/20">
                              Admin
                            </span>
                          </button>
                          {onOpenFirebaseConfig && (
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                onOpenFirebaseConfig();
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer text-left group"
                            >
                              <div className="flex items-center gap-2.5">
                                <Database className="w-4 h-4 text-[#ff851a]" />
                                <span>{t.nav.firebaseConfig}</span>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">
                                Config
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Sign out */}
                    <div className="pt-2 mt-2 border-t border-[#20202e]">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.nav.signOut}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-[#171722] shrink-0"
            >
              {t.nav.login}
            </button>
          )}

          {/* Mobile Tools Quick Access (ONLY on mobile screens <sm) - Symbol only without text name */}
          <button
            onClick={() => handleNavClick('tools')}
            className="sm:hidden flex items-center justify-center p-2 rounded-full bg-[#151520] hover:bg-[#1e1e2d] active:bg-[#252538] border border-[#28283c] text-[#ff851a] hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
            title={t.nav.pdfTools}
            aria-label="Browse all PDF tools"
          >
            <Layers className="w-4 h-4 text-[#ff5722]" />
          </button>

          {/* Orange Get Started Button with Arrow - HIDDEN on mobile (<sm), VISIBLE on tablet & laptop (sm:) */}
          <button
            onClick={() => {
              if (!user.isLoggedIn) {
                onOpenAuth('register');
              } else {
                handleNavClick('tools');
              }
            }}
            className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#ff5722] to-[#ff4500] hover:from-[#ff6934] hover:to-[#ff5722] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,87,34,0.4)] hover:shadow-[0_0_25px_rgba(255,87,34,0.6)] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>{t.nav.getStarted}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Three-Dot Menu Button - PROMINENT & CLEARLY VISIBLE on mobile (<md) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#14141d] hover:bg-[#1e1e2d] active:bg-[#27273a] border border-[#272738] hover:border-[#ff5722]/50 text-neutral-200 hover:text-white transition-all cursor-pointer shadow-sm shrink-0"
            aria-label="Toggle options menu"
            title="Options menu (Three dots)"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-200" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d12] border-b border-[#232330] px-4 py-4 space-y-3">
          {/* Mobile Theme Appearance Toggle */}
          <div className="p-2.5 rounded-xl bg-[#14141d] border border-[#242434] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isLightMode ? 'bg-[#ff5722]/15 text-[#ea580c]' : 'bg-[#ff5722]/15 text-[#ff851a]'
              }`}>
                {isLightMode ? <Sun className="w-4 h-4 text-[#ff5722]" /> : <Moon className="w-4 h-4 text-[#ff851a]" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Appearance</p>
                <p className="text-[10px] text-neutral-400">
                  {isLightMode ? 'Clean Light Mode' : 'High-Contrast Orange/Black'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                isLightMode
                  ? 'bg-[#ff5722] text-white border-[#ff5722]'
                  : 'bg-[#1e1e2d] text-[#ff851a] border-[#2f2f45]'
              }`}
            >
              {isLightMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          {user.isLoggedIn ? (
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-[#14141d] border border-[#242434] mb-3">
              <UserAvatar user={user} size="lg" showBadge={true} />
              <div className="min-w-0 w-full mt-2">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-neutral-400 truncate flex items-center justify-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-[#ff5722]" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#14141d] border border-[#242434] mb-3 text-center space-y-2.5">
              <p className="text-xs font-semibold text-neutral-300">{t.nav.signInToAccount}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#1f1f2e] border border-[#2d2d40] text-xs font-bold text-white hover:bg-[#28283c] transition-colors"
                >
                  {t.nav.signIn}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-[#ff5722] to-[#ff851a] text-xs font-bold text-white shadow-md transition-opacity hover:opacity-90"
                >
                  {t.nav.register}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleHomeClick}
            className={`block w-full text-left py-2 text-sm font-semibold transition-colors ${
              currentView === 'home' ? 'text-[#ff5722]' : 'text-neutral-300'
            }`}
          >
            {t.nav.home}
          </button>

          {/* Mobile All Tools Section */}
          <div className="pt-2 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#ff851a] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff5722]" />
                <span>{t.nav.pdfToolsDirectory}</span>
              </span>
              <button
                onClick={() => handleNavClick('tools')}
                className="text-[11px] font-semibold text-neutral-400 hover:text-white"
              >
                {t.nav.viewAll}
              </button>
            </div>

            {/* 8 Tools Grid for Mobile Drawer */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'jpg-to-pdf', label: t.tools.jpgToPdf.title, icon: Image, badge: 'Popular' },
                { id: 'merge-pdf', label: t.tools.mergePdf.title, icon: Layers, badge: 'Fast' },
                { id: 'split-pdf', label: t.tools.splitPdf.title, icon: Scissors },
                { id: 'compress-pdf', label: t.tools.compressPdf.title, icon: Minimize2, badge: 'Smart' },
                { id: 'pdf-to-jpg', label: t.tools.pdfToJpg.title, icon: FileImage },
                { id: 'rotate-pdf', label: t.tools.rotatePdf.title, icon: RotateCw },
                { id: 'watermark-pdf', label: t.tools.watermarkPdf.title, icon: Stamp },
                { id: 'protect-pdf', label: t.tools.protectPdf.title, icon: Lock, badge: 'Lock' },
                { id: 'inspect-pdf', label: t.tools.inspectPdf.title, icon: FileSearch, badge: 'Audit' },
              ].map((tool) => {
                const ToolIcon = tool.icon;
                const isSelected = currentView === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleNavClick(tool.id as ActiveView)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#ff5722]/20 border-[#ff5722]/50 text-white'
                        : 'bg-[#151520] hover:bg-[#1b1b28] border-[#222232] text-neutral-300 hover:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#ff5722]/10 flex items-center justify-center shrink-0">
                      <ToolIcon className="w-3.5 h-3.5 text-[#ff851a]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate leading-tight">{tool.label}</p>
                      {tool.badge && (
                        <span className="text-[9px] text-[#ff851a] font-mono leading-none block pt-0.5">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleSectionScroll('how-it-works')}
            className="block w-full text-left py-2 text-sm text-neutral-300 font-semibold"
          >
            {t.nav.howItWorks}
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="block w-full text-left py-2 text-sm text-neutral-300 font-semibold"
          >
            {t.nav.pricing}
          </button>
          <button
            onClick={() => handleSectionScroll('faq')}
            className="block w-full text-left py-2 text-sm text-neutral-300 font-semibold"
          >
            {t.nav.faq}
          </button>
          {user.isLoggedIn && (user.isAdmin || user.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase()) && (
            <>
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-2 w-full text-left py-2 text-sm font-semibold transition-colors ${
                  currentView === 'admin' ? 'text-[#ff5722]' : 'text-neutral-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#ff5722]" />
                <span>{t.nav.adminPanel}</span>
              </button>
              {onOpenFirebaseConfig && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenFirebaseConfig();
                  }}
                  className="flex items-center gap-2 w-full text-left py-2 text-sm font-semibold text-neutral-300 hover:text-[#ff851a] transition-colors"
                >
                  <Database className="w-4 h-4 text-[#ff851a]" />
                  <span>{t.nav.firebaseConfig}</span>
                </button>
              )}
            </>
          )}

          {user.isLoggedIn && (
            <div className="pt-2 border-t border-[#232332] space-y-2">
              <button
                onClick={() => handleNavClick('dashboard')}
                className="block w-full text-left py-1.5 text-xs text-neutral-300 font-semibold"
              >
                {t.nav.userDashboard}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="block w-full text-left py-1.5 text-xs text-red-400 font-semibold"
              >
                {t.nav.signOut}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

