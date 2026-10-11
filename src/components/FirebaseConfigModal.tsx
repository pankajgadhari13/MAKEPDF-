import React, { useState } from 'react';
import { 
  X, 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Key, 
  Layers, 
  Check, 
  Info
} from 'lucide-react';
import { 
  getActiveFirebaseConfig, 
  saveCustomFirebaseConfig, 
  resetFirebaseConfig, 
  testFirebaseConnection, 
  FirebaseConfigData 
} from '../firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = getActiveFirebaseConfig();
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [pasteSnippet, setPasteSnippet] = useState('');

  const [activeTab, setActiveTab] = useState<'paste' | 'manual' | 'guide'>('paste');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-parse pasted Firebase config snippet (JSON or JS object)
  const handleParseSnippet = () => {
    setStatusMessage(null);
    if (!pasteSnippet.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste your Firebase SDK config code first.' });
      return;
    }

    try {
      let snippet = pasteSnippet.trim();
      
      // If user pasted const firebaseConfig = { ... };
      const objectMatch = snippet.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        snippet = objectMatch[0];
      }

      // Convert JS object format to JSON if needed (e.g. unquoted keys)
      // Quick regex extraction:
      const extractKey = (key: string): string => {
        const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
        const match = snippet.match(regex);
        return match ? match[1] : '';
      };

      const extractedApiKey = extractKey('apiKey');
      const extractedProjectId = extractKey('projectId');
      const extractedAuthDomain = extractKey('authDomain');
      const extractedAppId = extractKey('appId');
      const extractedStorageBucket = extractKey('storageBucket');
      const extractedSenderId = extractKey('messagingSenderId');

      if (!extractedApiKey && !extractedProjectId) {
        throw new Error('Could not find apiKey or projectId in the pasted text.');
      }

      if (extractedApiKey) setApiKey(extractedApiKey);
      if (extractedProjectId) setProjectId(extractedProjectId);
      if (extractedAuthDomain) setAuthDomain(extractedAuthDomain);
      if (extractedAppId) setAppId(extractedAppId);
      if (extractedStorageBucket) setStorageBucket(extractedStorageBucket);
      if (extractedSenderId) setMessagingSenderId(extractedSenderId);

      setStatusMessage({ 
        type: 'success', 
        text: `Extracted successfully! Project: "${extractedProjectId || 'Found'}" — Ready to save & connect.` 
      });
      setActiveTab('manual');
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Could not auto-parse. Please fill in the fields manually or check the snippet format.' 
      });
    }
  };

  const handleSave = () => {
    setStatusMessage(null);
    if (!projectId.trim() || !apiKey.trim()) {
      setStatusMessage({ type: 'error', text: 'Project ID and API Key are required to connect.' });
      return;
    }

    const newConfig: FirebaseConfigData = {
      projectId: projectId.trim(),
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      appId: appId.trim() || '',
      storageBucket: storageBucket.trim() || `${projectId.trim()}.firebasestorage.app`,
      messagingSenderId: messagingSenderId.trim() || '',
      firestoreDatabaseId: '(default)',
    };

    saveCustomFirebaseConfig(newConfig);
    setStatusMessage({ 
      type: 'success', 
      text: `Connected to "${newConfig.projectId}"! The app is now linked to your Firebase project.` 
    });

    if (onConfigUpdated) onConfigUpdated();

    // Give user a moment to see the success message, then reload to initialize fresh SDK instances
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleReset = () => {
    resetFirebaseConfig();
    setStatusMessage({ type: 'info', text: 'Reset to default project configuration.' });
    if (onConfigUpdated) onConfigUpdated();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    const result = await testFirebaseConnection();
    setIsTesting(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const isCustomLinked = Boolean(
    localStorage.getItem('makepdf_custom_firebase_config')
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#0f0f15] border border-[#2b2b3d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f2e] bg-[#14141e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff5722]/15 border border-[#ff5722]/30 flex items-center justify-center text-[#ff5722]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Link Firebase Project (MAKEPDF)</span>
                {isCustomLinked ? (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono px-2 py-0.5 rounded-full font-semibold">
                    Custom Linked
                  </span>
                ) : (
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 font-mono px-2 py-0.5 rounded-full">
                    Default Project
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400">
                Connect your personal Firebase project for Auth & Firestore database
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a1a26] hover:bg-[#252538] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Connection Status Banner */}
        <div className="px-6 py-3 bg-[#171724] border-b border-[#232334] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-400">Active Project ID:</span>
            <span className="font-mono font-bold text-white bg-[#0e0e15] px-2 py-0.5 rounded border border-[#26263a]">
              {currentConfig.projectId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="text-[11px] font-semibold text-[#ff851a] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>
            {isCustomLinked && (
              <button
                onClick={handleReset}
                className="text-[11px] font-semibold text-neutral-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 ml-2"
                title="Reset to default workspace project"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1f1f2e] bg-[#111119] px-6">
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'border-[#ff5722] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ⚡ Quick Paste Snippet
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-[#ff5722] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📝 Manual Inputs
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[#ff5722] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            📖 Step-by-Step Guide
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Notification Messages */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{statusMessage.text}</div>
            </div>
          )}

          {/* TAB 1: QUICK PASTE */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="bg-[#141420] border border-[#242436] rounded-xl p-3.5 text-xs text-neutral-300">
                <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff5722]" />
                  Paste the <code className="text-[#ff851a] font-mono">firebaseConfig</code> from Firebase Console:
                </p>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Go to <span className="text-white font-medium">Firebase Console &gt; Project MAKEPDF &gt; Project Settings &gt; General &gt; Your apps &gt; SDK setup</span>. Copy the config block and paste it below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Paste SDK Config / JSON:
                </label>
                <textarea
                  value={pasteSnippet}
                  onChange={(e) => setPasteSnippet(e.target.value)}
                  placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "makepdf-xxxxx.firebaseapp.com",\n  projectId: "makepdf-xxxxx",\n  storageBucket: "makepdf-xxxxx.appspot.com",\n  messagingSenderId: "...",\n  appId: "1:...:web:..."\n};`}
                  rows={6}
                  className="w-full bg-[#11111a] border border-[#26263a] rounded-xl p-3 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-[#ff5722] transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleParseSnippet}
                  className="px-4 py-2 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-[#ff5722]/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract & Review Fields</span>
                </button>
                <span className="text-[11px] text-neutral-500">
                  Or switch to Manual Inputs tab
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL INPUTS */}
          {activeTab === 'manual' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Project ID <span className="text-[#ff5722]">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="e.g. makepdf-4b892 or makepdf"
                    className="w-full bg-[#12121c] border border-[#262638] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff5722]"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">From Firebase Project Settings</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    API Key (Web API Key) <span className="text-[#ff5722]">*</span>
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="e.g. AIzaSy..."
                    className="w-full bg-[#12121c] border border-[#262638] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff5722]"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Starts with AIzaSy...</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="e.g. makepdf.firebaseapp.com"
                    className="w-full bg-[#12121c] border border-[#262638] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff5722]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="e.g. 1:123456789:web:abcdef..."
                    className="w-full bg-[#12121c] border border-[#262638] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff5722]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Storage Bucket (Optional)
                  </label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="e.g. makepdf.firebasestorage.app"
                    className="w-full bg-[#12121c] border border-[#262638] rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff5722]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  Saving will link this app to your MAKEPDF project.
                </span>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-[#ff5722]/25"
                >
                  <Save className="w-4 h-4" />
                  <span>Connect & Save Project</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#13131e] border border-[#232334] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ff5722] text-white text-[11px] flex items-center justify-center font-mono">1</span>
                  Firebase Console Me Project Kholein
                </h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Apne browser me{' '}
                  <a 
                    href="https://console.firebase.google.com/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#ff851a] underline inline-flex items-center gap-1 font-semibold"
                  >
                    console.firebase.google.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  kholein aur apna banaya hua project <strong className="text-white">"MAKEPDF"</strong> choose karein.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#13131e] border border-[#232334] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ff5722] text-white text-[11px] flex items-center justify-center font-mono">2</span>
                  Web App Configuration Copy Karein
                </h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Left sidebar me upar gear icon <strong className="text-white">(⚙️ Project Settings)</strong> par click karein.
                  Niche scroll karein <strong className="text-white">"Your apps"</strong> section me. Agar Web App nahi bana hai to <code className="text-[#ff851a] bg-[#1a1a26] px-1 py-0.5 rounded">&lt;/&gt;</code> (Web) par click karke app create karein.
                  Wahan <code className="text-neutral-200 font-mono">const firebaseConfig = &#123; ... &#125;</code> milega.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#13131e] border border-[#232334] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ff5722] text-white text-[11px] flex items-center justify-center font-mono">3</span>
                  Email/Password Authentication Enable Karein
                </h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Firebase Console me <strong className="text-white">Build &gt; Authentication &gt; Sign-in method</strong> me jayein aur <strong className="text-emerald-400">Email/Password</strong> provider ko Enable karke Save karein.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#13131e] border border-[#232334] space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#ff5722] text-white text-[11px] flex items-center justify-center font-mono">4</span>
                  Cloud Firestore Database Create Karein
                </h4>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  <strong className="text-white">Build &gt; Firestore Database &gt; Create Database</strong> karein (Default mode or Test mode start kar sakte hain).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#ff5722]/10 border border-[#ff5722]/30 text-neutral-300 text-[11px]">
                <p className="font-semibold text-[#ff851a] mb-1">💡 Quick Tip:</p>
                <p>
                  Aap seedhe chat me bhi apna <code className="text-white font-mono">apiKey</code> aur <code className="text-white font-mono">projectId</code> paste kar sakte hain, hum turant link kar denge!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#12121a] border-t border-[#1f1f2e] flex items-center justify-between text-xs">
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#ff5722]" />
            <span>Open Firebase Console</span>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1d1d2b] hover:bg-[#28283c] text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
