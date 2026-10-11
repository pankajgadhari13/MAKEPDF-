import React, { useState } from 'react';
import { Terminal, CheckCircle2, Copy, Check, Play, FolderTree, Code2 } from 'lucide-react';

export const PythonPhaseConsole: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [healthResponse, setHealthResponse] = useState<any | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const simulateHealthCheck = () => {
    setIsPinging(true);
    setTimeout(() => {
      setHealthResponse({
        status: 'healthy',
        service: 'MAKEPDF Backend Service',
        version: '1.0.0-phase1',
        timestamp: new Date().toISOString(),
        theme: 'Orange & Black Futuristic',
        modules: {
          flask: 'active (Flask 3.0.3)',
          jinja2: 'ready (/app/templates)',
          static_assets: 'ready (/app/static/css, /app/static/js)',
          upload_directory: 'ready (/uploads)',
          output_directory: 'ready (/outputs)'
        }
      });
      setIsPinging(false);
    }, 400);
  };

  const filesPhase1 = [
    { path: 'requirements.txt', desc: 'Flask, PyMuPDF, pypdf, Pillow, img2pdf dependencies' },
    { path: '.env.example', desc: 'Environment variables template (SECRET_KEY, DATABASE_URL, etc.)' },
    { path: 'run.py', desc: 'Flask entry point script to run on port 5000' },
    { path: 'app/__init__.py', desc: 'Flask application factory & blueprints registration' },
    { path: 'app/config.py', desc: 'Base, Development, and Production config classes' },
    { path: 'app/routes/main.py', desc: 'Blueprint routes: /, /tools, /api/health' },
    { path: 'app/templates/base.html', desc: 'Orange & Black Jinja2 base layout with top navbar & footer' },
    { path: 'app/templates/index.html', desc: 'Hero section, 3D PDF visual & 9 tool cards' },
    { path: 'app/templates/tools.html', desc: 'Complete tools directory overview' },
    { path: 'app/static/css/style.css', desc: 'Futuristic Orange & Black stylesheet' },
    { path: 'app/static/js/main.js', desc: 'Vanilla JS mobile navigation & health ping' },
    { path: 'tests/test_basic.py', desc: 'Pytest test suite verifying 200 OK and health route' },
    { path: 'README.md', desc: 'Complete step-by-step beginner guide' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1f1f2b] pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#ff851a] uppercase mb-2">
          <Terminal className="w-4 h-4" />
          <span>PHASE 1 COMPLETE · PYTHON FLASK BACKEND</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Phase 1 Architecture & Execution Console
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Beginner-friendly breakdown of Python Flask setup, files created, terminal commands, and testing instructions.
        </p>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#12121a] border border-[#232332]">
          <span className="text-[11px] text-neutral-500 font-mono block">Current Phase</span>
          <span className="text-lg font-bold text-white font-display">Phase 1 / 11</span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Testing
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#12121a] border border-[#232332]">
          <span className="text-[11px] text-neutral-500 font-mono block">Theme Standard</span>
          <span className="text-lg font-bold text-[#ff851a] font-display">Orange & Black</span>
          <span className="text-[11px] text-neutral-400 mt-1 block">#0a0a0e / #ff6b00</span>
        </div>

        <div className="p-4 rounded-xl bg-[#12121a] border border-[#232332]">
          <span className="text-[11px] text-neutral-500 font-mono block">Backend Technology</span>
          <span className="text-lg font-bold text-white font-display">Python 3.11 + Flask</span>
          <span className="text-[11px] text-neutral-400 mt-1 block">Jinja2 + Vanilla JS</span>
        </div>
      </div>

      {/* Terminal Commands Guide */}
      <div className="rounded-2xl bg-[#12121a] border border-[#252535] p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#20202e]">
          <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#ff851a]" />
            <span>Terminal Commands to Run on Your Computer (Step-by-Step)</span>
          </h2>
          <span className="text-[10px] text-neutral-500 font-mono">LINUX / MAC / WINDOWS</span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
              <span>Step 1: Create and activate virtual environment</span>
              <button
                onClick={() => copyToClipboard('python3 -m venv venv && source venv/bin/activate', 'c1')}
                className="flex items-center gap-1 text-[11px] text-[#ff851a] hover:underline cursor-pointer"
              >
                {copiedCmd === 'c1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'c1' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#0b0b0f] border border-[#1f1f2b] text-xs font-mono text-neutral-200 overflow-x-auto">
              python3 -m venv venv && source venv/bin/activate
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
              <span>Step 2: Install required packages from requirements.txt</span>
              <button
                onClick={() => copyToClipboard('pip install -r requirements.txt', 'c2')}
                className="flex items-center gap-1 text-[11px] text-[#ff851a] hover:underline cursor-pointer"
              >
                {copiedCmd === 'c2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'c2' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#0b0b0f] border border-[#1f1f2b] text-xs font-mono text-neutral-200 overflow-x-auto">
              pip install -r requirements.txt
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
              <span>Step 3: Run the Flask server</span>
              <button
                onClick={() => copyToClipboard('python run.py', 'c3')}
                className="flex items-center gap-1 text-[11px] text-[#ff851a] hover:underline cursor-pointer"
              >
                {copiedCmd === 'c3' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'c3' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#0b0b0f] border border-[#1f1f2b] text-xs font-mono text-neutral-200 overflow-x-auto">
              python run.py
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
              <span>Step 4: Run automated tests with pytest</span>
              <button
                onClick={() => copyToClipboard('pytest tests/', 'c4')}
                className="flex items-center gap-1 text-[11px] text-[#ff851a] hover:underline cursor-pointer"
              >
                {copiedCmd === 'c4' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCmd === 'c4' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#0b0b0f] border border-[#1f1f2b] text-xs font-mono text-neutral-200 overflow-x-auto">
              pytest tests/
            </pre>
          </div>
        </div>
      </div>

      {/* Live Health Route Simulator */}
      <div className="rounded-2xl bg-[#12121a] border border-[#252535] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#20202e]">
          <div>
            <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#ff851a]" />
              <span>Phase 1 Test: Endpoint GET /api/health</span>
            </h2>
            <p className="text-xs text-neutral-400">Inspect the JSON payload returned by the Flask health route.</p>
          </div>
          <button
            onClick={simulateHealthCheck}
            disabled={isPinging}
            className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#ff851a] hover:bg-[#ff9933] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isPinging ? 'Pinging...' : 'Test /api/health'}</span>
          </button>
        </div>

        {healthResponse && (
          <pre className="p-4 rounded-xl bg-[#0b0b0f] border border-[#ff6b00]/30 text-xs font-mono text-[#ff851a] overflow-x-auto">
            {JSON.stringify(healthResponse, null, 2)}
          </pre>
        )}
      </div>

      {/* Files Created in Phase 1 */}
      <div className="rounded-2xl bg-[#12121a] border border-[#252535] p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#20202e]">
          <FolderTree className="w-4 h-4 text-[#ff851a]" />
          <h2 className="text-sm font-bold text-white font-display">
            Phase 1 Files Created in Repository
          </h2>
        </div>

        <div className="divide-y divide-[#1e1e2b]">
          {filesPhase1.map((f) => (
            <div key={f.path} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-mono text-[#ff851a] font-semibold">{f.path}</span>
              <span className="text-neutral-400">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
