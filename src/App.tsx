/**
 * MAKEPDF - Main Application Component
 * Theme: Orange & Black Futuristic Design
 * Tagline: "Powerful PDF Tools. Made Simple."
 */

import { useState, useEffect } from 'react';
import { ActiveView, ProcessedItem, UserState } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ToolGrid } from './components/ToolGrid';
import { HowItWorks } from './components/HowItWorks';
import { FAQ } from './components/FAQ';
import { JpgToPdfTool } from './components/tools/JpgToPdfTool';
import { MergePdfTool } from './components/tools/MergePdfTool';
import { SplitPdfTool } from './components/tools/SplitPdfTool';
import { CompressPdfTool } from './components/tools/CompressPdfTool';
import { PdfToJpgTool } from './components/tools/PdfToJpgTool';
import { RotatePdfTool } from './components/tools/RotatePdfTool';
import { WatermarkPdfTool } from './components/tools/WatermarkPdfTool';
import { ProtectPdfTool } from './components/tools/ProtectPdfTool';
import { InspectPdfTool } from './components/tools/InspectPdfTool';
import { WordToPdfTool } from './components/tools/WordToPdfTool';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { Pricing } from './components/Pricing';
import { About } from './components/About';
import { PythonPhaseConsole } from './components/PythonPhaseConsole';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { Footer } from './components/Footer';
import { DownloadAppSection } from './components/DownloadAppSection';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { recordWebsiteVisit, isAdminEmail, ADMIN_CREDENTIALS } from './utils/analyticsStore';
import { Language, translations } from './utils/translations';
import { smoothScrollToTop } from './utils/scrollHelper';
import { 
  auth, 
  logoutUser, 
  subscribeToUserProfile, 
  subscribeToUserHistory, 
  saveHistoryToFirebase, 
  updateUserStats, 
  deleteHistoryFromFirebase, 
  clearAllHistoryFromFirebase,
  isRegistrationFlow
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const THEME_STORAGE_KEY = 'makepdf_theme';
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light') return true;
      if (saved === 'dark') return false;
      return false; // Default: high-contrast orange/black
    } catch {
      return false;
    }
  });

  // Sync theme attribute on document root and persist in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isLightMode ? 'light' : 'dark');
    } catch {}

    const root = document.documentElement;
    if (isLightMode) {
      root.setAttribute('data-theme', 'light');
      root.classList.add('light-mode');
      root.classList.remove('dark');
    } else {
      root.setAttribute('data-theme', 'dark');
      root.classList.remove('light-mode');
      root.classList.add('dark');
    }
  }, [isLightMode]);
  const [lang, setLang] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('makepdf_lang');
      if (savedLang === 'hi' || savedLang === 'en') {
        return savedLang;
      }
    } catch {}
    return 'en';
  });
  const [heroDroppedFiles, setHeroDroppedFiles] = useState<FileList | null>(null);
  const [chainedPdfFile, setChainedPdfFile] = useState<File | null>(null);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('makepdf_lang', newLang);
    } catch {}
  };

  // Track each page visit in persistent analytics telemetry
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      'home': 'Home / Hero',
      'tools': 'All Tools',
      'jpg-to-pdf': 'JPG to PDF',
      'merge-pdf': 'Merge PDF',
      'split-pdf': 'Split PDF',
      'compress-pdf': 'Compress PDF',
      'pdf-to-jpg': 'PDF to JPG',
      'rotate-pdf': 'Rotate PDF',
      'watermark-pdf': 'Watermark PDF',
      'protect-pdf': 'Protect PDF',
      'inspect-pdf': 'PDF Metadata Inspector',
      'dashboard': 'Dashboard',
      'history': 'File History',
      'pricing': 'Pricing',
      'faq': 'FAQ & Instructions',
      'about': 'About',
      'phase1-console': 'Python Backend',
      'admin': 'Admin Panel',
    };
    recordWebsiteVisit(pageTitles[currentView] || currentView);
    smoothScrollToTop();
  }, [currentView]);

  const handleNavigateToTool = (tool: ActiveView, file?: File) => {
    setChainedPdfFile(file || null);
    setCurrentView(tool);
    smoothScrollToTop();
  };

  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' | 'admin' }>({
    open: false,
    mode: 'login',
  });
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);

  const [user, setUser] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('makepdf_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return {
            isLoggedIn: true,
            name: parsed.name || 'User',
            email: parsed.email,
            avatarUrl: parsed.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(parsed.name || 'User')}&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true`,
            filesProcessed: parsed.filesProcessed || 0,
            pdfsCreated: parsed.pdfsCreated || 0,
            storageUsedMb: parsed.storageUsedMb || 0,
            isAdmin: parsed.role === 'admin' || isAdminEmail(parsed.email),
          };
        }
      }
    } catch {}
    return {
      isLoggedIn: false,
      name: '',
      email: '',
      avatarUrl: '',
      filesProcessed: 0,
      pdfsCreated: 0,
      storageUsedMb: 0,
      isAdmin: false,
    };
  });

  // Real user processing history - Only populated when user compresses or uses PDF tools
  const [history, setHistory] = useState<ProcessedItem[]>(() => {
    try {
      const saved = localStorage.getItem('makepdf_real_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Exclude any legacy mock demo items
          return parsed.filter((item) => item && item.id && !item.id.startsWith('demo-'));
        }
      }
    } catch (e) {
      console.warn('Could not load stored history:', e);
    }
    return [];
  });

  // Synchronize Firebase Auth user state, Firestore user profile, and user document history
  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeHistory: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (isRegistrationFlow) {
        return;
      }
      if (fbUser) {
        const derivedName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
        const isUserAdmin = isAdminEmail(fbUser.email || '');
        const avatar = fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=ff5722,ea580c,f97316&textColor=ffffff&bold=true`;

        setUser((prev) => ({
          ...prev,
          isLoggedIn: true,
          name: derivedName,
          email: fbUser.email || prev.email,
          avatarUrl: avatar,
          isAdmin: isUserAdmin,
        }));

        // Subscribe to Firestore user profile
        try {
          unsubscribeProfile = subscribeToUserProfile(fbUser.uid, (profileData) => {
            if (profileData) {
              setUser((prev) => ({
                ...prev,
                ...profileData,
                isLoggedIn: true,
              }));
            }
          });
        } catch (e) {
          console.warn('Could not subscribe to user profile:', e);
        }

        // Subscribe to Firestore user history
        try {
          unsubscribeHistory = subscribeToUserHistory(fbUser.uid, (items) => {
            const realItems = items || [];
            setHistory(realItems);
            try {
              localStorage.setItem('makepdf_real_history', JSON.stringify(realItems));
            } catch {}
          });
        } catch (e) {
          console.warn('Could not subscribe to user history:', e);
        }
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }
        if (unsubscribeHistory) {
          unsubscribeHistory();
          unsubscribeHistory = undefined;
        }

        // Restore local user session if present
        try {
          const saved = localStorage.getItem('makepdf_current_user');
          if (saved) {
            const localUser = JSON.parse(saved);
            if (localUser && localUser.email) {
              setUser((prev) => ({
                ...prev,
                ...localUser,
                isLoggedIn: true,
              }));
              if (localUser.userId?.startsWith('local_')) {
                subscribeToUserHistory(localUser.userId, (items) => {
                  const realItems = items || [];
                  setHistory(realItems);
                  try {
                    localStorage.setItem('makepdf_real_history', JSON.stringify(realItems));
                  } catch {}
                });
              }
              return;
            }
          }
        } catch (e) {
          console.warn('Could not read cached session:', e);
        }

        // When no active user, mark logged out
        setUser({
          isLoggedIn: false,
          name: '',
          email: '',
          avatarUrl: '',
          filesProcessed: 0,
          pdfsCreated: 0,
          storageUsedMb: 0,
          isAdmin: false,
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeHistory) unsubscribeHistory();
    };
  }, []);

  const handleHeroFilesSelected = (files: FileList) => {
    setHeroDroppedFiles(files);
    setCurrentView('jpg-to-pdf');
  };

  const handleRecordHistory = (item: ProcessedItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((p) => p.id !== item.id);
      const updated = [item, ...filtered];
      try {
        localStorage.setItem('makepdf_real_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      saveHistoryToFirebase(currentUid, item).catch((err) => console.warn('Could not persist history to Firestore:', err));
      updateUserStats(currentUid, 1, 1, 0.3).catch((err) => console.warn('Could not update user stats in Firestore:', err));
    } else {
      try {
        const saved = localStorage.getItem('makepdf_current_user');
        if (saved) {
          const localUser = JSON.parse(saved);
          if (localUser.userId?.startsWith('local_')) {
            saveHistoryToFirebase(localUser.userId, item).catch(() => {});
          }
        }
      } catch {}
    }

    setUser((prev) => ({
      ...prev,
      filesProcessed: prev.filesProcessed + 1,
      pdfsCreated: prev.pdfsCreated + 1,
      storageUsedMb: Number((prev.storageUsedMb + 0.3).toFixed(1)),
    }));
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('makepdf_real_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      deleteHistoryFromFirebase(currentUid, id).catch((err) => console.warn('Could not delete history in Firestore:', err));
    } else {
      try {
        const saved = localStorage.getItem('makepdf_current_user');
        if (saved) {
          const localUser = JSON.parse(saved);
          if (localUser.userId?.startsWith('local_')) {
            deleteHistoryFromFirebase(localUser.userId, id).catch(() => {});
          }
        }
      } catch {}
    }
  };

  const handleClearHistory = () => {
    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      const ids = history.map((h) => h.id);
      clearAllHistoryFromFirebase(currentUid, ids).catch((err) => console.warn('Could not clear history in Firestore:', err));
    } else {
      try {
        const saved = localStorage.getItem('makepdf_current_user');
        if (saved) {
          const localUser = JSON.parse(saved);
          if (localUser.userId?.startsWith('local_')) {
            const ids = history.map((h) => h.id);
            clearAllHistoryFromFirebase(localUser.userId, ids).catch(() => {});
          }
        }
      } catch {}
    }
    setHistory([]);
    try {
      localStorage.removeItem('makepdf_real_history');
    } catch {}
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setUser({
      isLoggedIn: false,
      name: 'Guest',
      email: '',
      filesProcessed: 0,
      pdfsCreated: 0,
      storageUsedMb: 0,
      isAdmin: false,
    });
  };

  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
  };

  const isSuperAdminUser = !!(
    user.isLoggedIn &&
    (user.isAdmin || user.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase())
  );

  // Strictly protect /admin: if a non-admin user attempts to access admin view, redirect to home immediately
  useEffect(() => {
    if (currentView === 'admin' && !isSuperAdminUser) {
      setCurrentView('home');
    }
  }, [currentView, isSuperAdminUser]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isLightMode ? 'bg-[#f8f8fa] text-[#111116]' : 'bg-[#08080a] text-[#f3f4f6]'}`}>
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        onLogout={handleLogout}
        isLightMode={isLightMode}
        onToggleTheme={toggleTheme}
        onOpenFirebaseConfig={isSuperAdminUser ? () => setIsFirebaseConfigOpen(true) : undefined}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main Content Router */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentView === 'home' && (
          <>
            {/* The exact Hero section matching the screenshot */}
            <Hero
              onNavigate={setCurrentView}
              onFilesSelected={handleHeroFilesSelected}
              lang={lang}
            />

            {/* Complete Tool Grid */}
            <ToolGrid onSelectTool={setCurrentView} lang={lang} />

            {/* Step-by-step How it works */}
            <HowItWorks lang={lang} />

            {/* Frequently Asked Questions */}
            <FAQ lang={lang} />
          </>
        )}

        {currentView === 'tools' && (
          <div className="py-8">
            <ToolGrid
              onSelectTool={setCurrentView}
              title={lang === 'hi' ? 'सभी PDF टूल्स डायरेक्टरी' : 'All PDF Tools Directory'}
              subtitle={lang === 'hi' ? 'नीचे हमारे सभी 9 शक्तिशाली और तेज़ डॉक्यूमेंट टूल्स उपलब्ध हैं।' : 'Access our complete suite of 9 high-performance document utilities below.'}
              lang={lang}
            />
          </div>
        )}

        {currentView === 'jpg-to-pdf' && (
          <JpgToPdfTool
            onBack={() => {
              setHeroDroppedFiles(null);
              setCurrentView('home');
            }}
            onRecordHistory={handleRecordHistory}
            initialFiles={heroDroppedFiles}
            onNavigateToTool={handleNavigateToTool}
          />
        )}

        {currentView === 'merge-pdf' && (
          <MergePdfTool
            onBack={() => setCurrentView('tools')}
            onRecordHistory={handleRecordHistory}
            onNavigateToTool={handleNavigateToTool}
            initialFile={chainedPdfFile}
          />
        )}

        {currentView === 'split-pdf' && (
          <SplitPdfTool
            onBack={() => setCurrentView('tools')}
            onRecordHistory={handleRecordHistory}
            onNavigateToTool={handleNavigateToTool}
            initialFile={chainedPdfFile}
          />
        )}

        {currentView === 'compress-pdf' && (
          <CompressPdfTool
            onBack={() => setCurrentView('tools')}
            onRecordHistory={handleRecordHistory}
            onNavigateToTool={handleNavigateToTool}
            initialFile={chainedPdfFile}
          />
        )}

        {currentView === 'pdf-to-jpg' && (
          <PdfToJpgTool
            onBack={() => setCurrentView('tools')}
            onRecordHistory={handleRecordHistory}
            onNavigateToTool={handleNavigateToTool}
            initialFile={chainedPdfFile}
          />
        )}

        {currentView === 'rotate-pdf' && (
          <RotatePdfTool
            onBack={() => setCurrentView('tools')}
            onRecordHistory={handleRecordHistory}
            onNavigateToTool={handleNavigateToTool}
            initialFile={chainedPdfFile}
          />
        )}

        {currentView === 'watermark-pdf' && (
          <WatermarkPdfTool
            onBack={() => setCurrentView('tools')}
            onRecordHistory={handleRecordHistory}
            onNavigateToTool={handleNavigateToTool}
            initialFile={chainedPdfFile}
          />
        )}

        {currentView === 'protect-pdf' && (
          <ProtectPdfTool
            onBack={() => setCurrentView('tools')}
            onRecordHistory={handleRecordHistory}
            onNavigateToTool={handleNavigateToTool}
            initialFile={chainedPdfFile}
          />
        )}

        {currentView === 'inspect-pdf' && (
          <InspectPdfTool
            onBack={() => setCurrentView('tools')}
            onRecordHistory={handleRecordHistory}
            onNavigateToTool={handleNavigateToTool}
            initialFile={chainedPdfFile}
          />
        )}

        {currentView === 'word-to-pdf' && (
          <WordToPdfTool
            onBack={() => setCurrentView('tools')}
            onRecordHistory={handleRecordHistory}
            onNavigateToTool={handleNavigateToTool}
            initialFile={chainedPdfFile}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            user={user}
            history={history}
            onNavigate={setCurrentView}
            onDeleteItem={handleDeleteHistoryItem}
          />
        )}

        {currentView === 'history' && (
          <History
            history={history}
            onBack={() => setCurrentView('home')}
            onDeleteItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
          />
        )}

        {currentView === 'pricing' && (
          <Pricing onNavigate={setCurrentView} lang={lang} />
        )}

        {currentView === 'faq' && (
          <FAQ
            lang={lang}
            isStandalone={true}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'about' && (
          <About />
        )}

        {currentView === 'phase1-console' && (
          <PythonPhaseConsole />
        )}

        {currentView === 'admin' && isSuperAdminUser && (
          <AdminPanel
            currentUser={user}
            onNavigateHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAdminLoginSuccess={(adminEmail) => {
              setUser((prev) => ({
                 ...prev,
                 isLoggedIn: true,
                 name: 'Pankaj Gadhari',
                 email: adminEmail,
                 isAdmin: true,
               }));
            }}
            onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
          />
        )}
      </main>

      {/* Download App Section (Above Footer) & Footer */}
      {currentView !== 'admin' && (
        <>
          {/* Above Footer: User Application Download Bar (One Line, Clean & Minimal) */}
          <DownloadAppSection lang={lang} />
          <Footer onNavigate={setCurrentView} lang={lang} user={user} />
        </>
      )}

      {/* Auth Modal */}
      {authModal.open && (
        <AuthModal
          mode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onLoginSuccess={(updatedUser) => {
            setUser((prev) => ({
              ...prev,
              ...updatedUser,
              isAdmin: isAdminEmail(updatedUser.email || prev.email),
            }));
          }}
          onOpenAdminPanel={() => {
            setCurrentView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenFirebaseConfig={isSuperAdminUser ? () => setIsFirebaseConfigOpen(true) : undefined}
          lang={lang}
        />
      )}

      {/* Firebase Custom Project Config Modal - strictly for authenticated Super Admin */}
      {isSuperAdminUser && (
        <FirebaseConfigModal
          isOpen={isFirebaseConfigOpen}
          onClose={() => setIsFirebaseConfigOpen(false)}
        />
      )}

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens <md) */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        lang={lang}
      />
    </div>
  );
}
