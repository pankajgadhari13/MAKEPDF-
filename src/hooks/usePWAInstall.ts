import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Global singleton state so beforeinstallprompt is captured immediately at script execution
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();
let isGlobalInstalled = false;

if (typeof window !== 'undefined') {
  // Capture beforeinstallprompt as soon as browser fires it
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser mini-infobar so our custom safe button can trigger it
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((listener) => listener(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    isGlobalInstalled = true;
    globalDeferredPrompt = null;
    promptListeners.forEach((listener) => listener(null));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(isGlobalInstalled);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    // Detect standalone / already installed mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(standaloneMode);
    setIsInstalled(standaloneMode || isGlobalInstalled);

    // Detect OS / device
    const ua = window.navigator.userAgent.toLowerCase();
    const iOSDevice = /iphone|ipad|ipod/.test(ua);
    const androidDevice = /android/.test(ua);
    const inApp = /fbav|instagram|fban|line|micromessenger|whatsapp|snapchat/.test(ua);

    setIsIOS(iOSDevice);
    setIsAndroid(androidDevice);
    setIsInAppBrowser(inApp);

    // Subscribe to global prompt updates
    const listener = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
      if (isGlobalInstalled) setIsInstalled(true);
    };

    promptListeners.add(listener);
    // Initial sync
    if (globalDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    return () => {
      promptListeners.delete(listener);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const choice = await promptToUse.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          isGlobalInstalled = true;
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('Install prompt error:', err);
        return 'manual';
      }
    }
    return 'manual';
  };

  return {
    isInstallable: !!(deferredPrompt || globalDeferredPrompt),
    isInstalled,
    isIOS,
    isAndroid,
    isStandalone,
    isInAppBrowser,
    deferredPrompt: deferredPrompt || globalDeferredPrompt,
    install,
  };
}
