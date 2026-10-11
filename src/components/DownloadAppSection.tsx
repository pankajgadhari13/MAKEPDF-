import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle, 
  X, 
  ShieldCheck, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../utils/translations';

interface DownloadAppSectionProps {
  lang?: Language;
}

export const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({ lang = 'en' }) => {
  const isHindi = lang === 'hi';
  const { isInstallable, isInstalled, isIOS, isAndroid, isStandalone, isInAppBrowser, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  const handleDownloadClick = async () => {
    if (isStandalone || isInstalled) {
      setInstallStatus('already_installed');
      setTimeout(() => setInstallStatus(null), 3500);
      return;
    }

    if (isInstallable) {
      try {
        const res = await install();
        if (res === 'accepted') {
          setInstallStatus('success');
          setTimeout(() => setInstallStatus(null), 4000);
          return;
        } else if (res === 'manual') {
          setShowGuideModal(true);
          return;
        }
      } catch (e) {
        console.warn('Install trigger error:', e);
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <div id="download-app-section" className="w-full bg-[#0a0a0e] border-t border-[#1b1b26] py-3.5 px-4 sm:px-8">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Assurance that installation is 100% safe, verified and offline-ready */}
        <div className="flex items-center gap-2.5 text-neutral-300 text-center sm:text-left flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Safe &amp; Verified</span>
          </div>
          <span className="font-semibold text-white">MAKEPDF Mobile &amp; Desktop App:</span>
          <span className="text-neutral-400 hidden md:inline">
            Fast offline use with zero harmful file downloads or warnings.
          </span>
        </div>

        {/* Right: Install Button & Status Feedback */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-click-to-download"
            onClick={handleDownloadClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff3d00] hover:from-[#ff6934] hover:to-[#ff5722] text-white font-bold text-xs shadow-md shadow-[#ff5722]/20 hover:shadow-[#ff5722]/40 transition-all cursor-pointer"
            title="Install official MAKEPDF app without harmful warnings"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isStandalone || isInstalled ? 'App Installed' : 'Install App'}</span>
          </button>

          {installStatus === 'already_installed' && (
            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Already Installed!</span>
            </span>
          )}

          {installStatus === 'success' && (
            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Installed Successfully!</span>
            </span>
          )}
        </div>

      </div>

      {/* Safe Installation Guidance Modal (Zero Warnings, 100% Native Web App) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#12121a] border border-[#2b2b3d] p-5 sm:p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#1f1f2e] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Safety Guarantee Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isHindi ? '100% सुरक्षित और डायरेक्ट इंस्टॉलेशन' : '100% Safe & Direct Installation'}
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium">No Harmful File Warnings • Zero Risk</p>
              </div>
            </div>

            {/* Explanatory badge */}
            <div className="bg-[#181824] border border-[#262638] rounded-xl p-3 mb-4 text-[11px] text-neutral-300 space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff5722]" />
                {isHindi ? 'यह एक आधिकारिक Progressive Web App (PWA) है' : 'Official Progressive Web App (PWA)'}
              </p>
              <p className="text-neutral-400 leading-relaxed">
                {isHindi 
                  ? <>फोन में किसी भी खतरनाक या अनजान <code>.html</code> / <code>.apk</code> फाइल को डाउनलोड करने की जरूरत नहीं है। यह बिना किसी खतरे के सीधे आपके मोबाइल की होम स्क्रीन पर एक सुरक्षित ऐप की तरह जुड़ जाता है।</>
                  : <>No need to download risky or unknown <code>.html</code> / <code>.apk</code> files. MAKEPDF installs safely and directly to your home screen with zero warnings.</>
                }
              </p>
            </div>

            {/* In-App Browser Warning (WhatsApp / Instagram / Facebook) */}
            {isInAppBrowser && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px]">
                  {isHindi 
                    ? <>आप अभी इन-ऐप ब्राउज़र में हैं। कृपया ऊपर <strong>Three dots (⋮)</strong> पर क्लिक करके <strong>"Open in Chrome"</strong> चुनें ताकि ऐप आसानी से इंस्टॉल हो सके।</>
                    : <>You are currently in an in-app browser. Tap <strong>Three dots (⋮)</strong> and select <strong>"Open in Chrome"</strong> to install smoothly.</>
                  }
                </p>
              </div>
            )}

            {/* Step-by-Step Instructions based on OS */}
            <div className="space-y-3 mb-5">
              <p className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono">
                {isIOS 
                  ? (isHindi ? 'iPhone / iPad (Safari) के लिए निर्देश:' : 'Instructions for iPhone / iPad (Safari):') 
                  : (isHindi ? 'Android (Google Chrome) के लिए निर्देश:' : 'Instructions for Android (Google Chrome):')}
              </p>

              {isIOS ? (
                <div className="space-y-2.5 text-xs text-neutral-300">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#171722] border border-[#242436]">
                    <div className="w-6 h-6 rounded-lg bg-[#222232] text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-[#ff5722]" /> {isHindi ? 'Safari में Share बटन दबाएं' : 'Tap Share in Safari'}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {isHindi ? <>स्क्रीन के नीचे स्थित <strong>Share (⬆️)</strong> आइकन पर टैप करें।</> : <>Tap the <strong>Share (⬆️)</strong> icon at the bottom of the screen.</>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#171722] border border-[#242436]">
                    <div className="w-6 h-6 rounded-lg bg-[#222232] text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <PlusSquare className="w-3.5 h-3.5 text-emerald-400" /> {isHindi ? '"Add to Home Screen" चुनें' : 'Choose "Add to Home Screen"'}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {isHindi ? <>नीचे स्क्रॉल करें और <strong>"Add to Home Screen (होम स्क्रीन में जोड़ें)"</strong> पर टैप करें।</> : <>Scroll down and tap <strong>"Add to Home Screen"</strong>.</>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#171722] border border-[#242436]">
                    <div className="w-6 h-6 rounded-lg bg-[#222232] text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-white">{isHindi ? '"Add" पर टैप करें' : 'Tap "Add"'}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {isHindi ? <>ऊपर दायें कोने में <strong>Add</strong> पर टैप करें। ऐप आपके फोन पर सुरक्षित तैयार हो जाएगा।</> : <>Tap <strong>Add</strong> in the top-right corner. The app will be ready on your phone.</>}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs text-neutral-300">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#171722] border border-[#242436]">
                    <div className="w-6 h-6 rounded-lg bg-[#222232] text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <MoreVertical className="w-3.5 h-3.5 text-[#ff5722]" /> {isHindi ? 'Chrome मेनू (⋮) खोलें' : 'Open Chrome Menu (⋮)'}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {isHindi ? <>ब्राउज़र में सबसे ऊपर दाईं ओर स्थित <strong>Three dots (⋮)</strong> पर टैप करें।</> : <>Tap the <strong>Three dots (⋮)</strong> in the top-right corner of the browser.</>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#171722] border border-[#242436]">
                    <div className="w-6 h-6 rounded-lg bg-[#222232] text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5 text-emerald-400" /> {isHindi ? '"Install app" या "Add to Home screen" चुनें' : 'Select "Install app" or "Add to Home screen"'}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {isHindi ? <>मेनू में से <strong>"Install app"</strong> या <strong>"Add to Home screen (होम स्क्रीन में जोड़ें)"</strong> विकल्प चुनें।</> : <>From the menu, choose <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#171722] border border-[#242436]">
                    <div className="w-6 h-6 rounded-lg bg-[#222232] text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-white">{isHindi ? '"Install" पर क्लिक करें' : 'Tap "Install"'}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {isHindi ? <>बिना किसी हानिकारक चेतावनी (harmful warning) के ऐप तुरंत आपके होम स्क्रीन पर आ जाएगा!</> : <>The app installs instantly to your home screen with zero harmful warnings!</>}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons inside modal */}
            <div className="pt-3 border-t border-[#20202f] flex flex-col sm:flex-row items-center gap-2">
              {isInstallable && (
                <button
                  onClick={async () => {
                    const res = await install();
                    if (res === 'accepted') {
                      setShowGuideModal(false);
                      setInstallStatus('success');
                      setTimeout(() => setInstallStatus(null), 4000);
                    }
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff3d00] hover:from-[#ff6934] hover:to-[#ff5722] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isHindi ? 'अभी तुरंत इंस्टॉल करें (1-Click Install)' : 'Install Now (1-Click Install)'}</span>
                </button>
              )}
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1c1c28] hover:bg-[#252536] text-neutral-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                {isHindi ? 'समझ गया (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
