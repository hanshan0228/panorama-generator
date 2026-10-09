import { useState } from 'react';
import {
  Compass,
  Sparkles,
  Eye,
  Box,
  Globe2,
  CreditCard,
  Code2,
  Zap,
  Activity,
} from 'lucide-react';
import type { ActiveTab } from './types/panorama';
import { GeneratorTab } from './components/GeneratorTab';
import { ViewerTab } from './components/ViewerTab';
import { CubemapTab } from './components/CubemapTab';
import { GlobeTab } from './components/GlobeTab';
import { PricingTab } from './components/PricingTab';
import { AdminTab } from './components/AdminTab';
import { generateProceduralPanorama } from './utils/proceduralPanoramas';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');

  // Initialize with a default rich 2:1 equirectangular panorama
  const [currentPanoramaUrl, setCurrentPanoramaUrl] = useState<string>(() => {
    const canvas = generateProceduralPanorama(
      'cyberpunk',
      'futuristic cyberpunk city at night, neon holograms, 8k equirectangular 360 panorama',
      2048,
      1024
    );
    return canvas.toDataURL('image/png');
  });

  return (
    <div className="min-h-screen bg-[#060810] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden bg-grid-cyber">
      {/* Ambient background light glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 left-1/4 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-purple-600/12 rounded-full blur-[150px]"
        />
        <div
          className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px]"
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#060812]/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 relative z-10">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 rounded-2xl text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300">
              <Compass className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  PanoramaAI
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 rounded-md font-semibold tracking-wider">
                  STUDIO
                </span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>AI 360° VR &amp; Skybox Engine</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <nav className="flex items-center gap-1 bg-[#0c1020]/80 border border-white/[0.08] p-1.5 rounded-2xl backdrop-blur-xl shadow-inner overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AI Generator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('viewer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'viewer'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>360° Viewer</span>
              <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">
                FREE
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cubemap')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'cubemap'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cubemap</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('globe')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'globe'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Photo to Globe</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-pink-400" />
              <span>Pricing</span>
            </button>
          </nav>

          {/* Right Action Trigger */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className="shimmer-btn px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Upgrade Pro</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Canvas / Tab Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
        {activeTab === 'generator' && (
          <GeneratorTab
            currentPanoramaUrl={currentPanoramaUrl}
            onPanoramaChange={setCurrentPanoramaUrl}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'viewer' && (
          <ViewerTab
            currentPanoramaUrl={currentPanoramaUrl}
            onPanoramaChange={setCurrentPanoramaUrl}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'cubemap' && (
          <CubemapTab currentPanoramaUrl={currentPanoramaUrl} />
        )}

        {activeTab === 'globe' && (
          <GlobeTab currentPanoramaUrl={currentPanoramaUrl} />
        )}

        {activeTab === 'pricing' && <PricingTab />}

        {activeTab === 'admin' && <AdminTab />}
      </main>

      {/* Modern Studio Footer */}
      <footer className="border-t border-white/[0.08] bg-[#060812]/90 backdrop-blur-xl py-8 mt-12 text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-200 font-semibold tracking-tight">PanoramaAI Studio</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Industrial Equirectangular 360° VR Pipeline</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('viewer')}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Free 360 Viewer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cubemap')}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Cubemap Slicer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('globe')}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Photo to Globe
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Pricing &amp; API
            </button>
            <button
              type="button"
              onClick={() => {
                const pin = prompt('Enter Admin PIN:');
                if (pin === 'admin888') {
                  setActiveTab('admin');
                } else if (pin !== null) {
                  alert('Invalid PIN');
                }
              }}
              className="text-slate-600 hover:text-slate-400 text-[10px] transition-colors cursor-pointer"
            >
              Admin
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>WebGL 3D Active</span>
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <Code2 className="w-3.5 h-3.5" />
              <span>Three.js • 2:1 Equirectangular</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
