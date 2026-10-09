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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="p-2 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 rounded-xl text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">PanoramaAI</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-md">
                  STUDIO
                </span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">AI 360° VR &amp; Skybox Engine</div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <nav className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Generator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('viewer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'viewer'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>360° Viewer</span>
              <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded font-mono">FREE</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cubemap')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'cubemap'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>Cubemap</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('globe')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'globe'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Photo to Globe</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pricing</span>
            </button>
          </nav>

          {/* Right Action Trigger */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Upgrade Pro</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Canvas / Tab Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
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
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-medium">PanoramaAI Studio</span>
            <span>•</span>
            <span>Benchmarked Equirectangular 360° VR Pipeline</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button type="button" onClick={() => setActiveTab('viewer')} className="hover:text-slate-200">
              Free 360 Viewer
            </button>
            <button type="button" onClick={() => setActiveTab('cubemap')} className="hover:text-slate-200">
              Cubemap Slicer
            </button>
            <button type="button" onClick={() => setActiveTab('globe')} className="hover:text-slate-200">
              Photo to Globe
            </button>
            <button type="button" onClick={() => setActiveTab('pricing')} className="hover:text-slate-200">
              API License
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
              className="text-slate-700 hover:text-slate-500 text-[10px]"
            >
              Admin
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Code2 className="w-4 h-4" />
            <span>WebGL Three.js • Equirectangular 2:1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
