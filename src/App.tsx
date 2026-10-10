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
  ChevronDown,
  Coins,
  Wand2,
  ImagePlus,
  ShieldCheck,
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
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

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
    <div className="min-h-screen bg-[#040c1a] text-sky-100 flex flex-col relative overflow-hidden bg-grid-cyber selection:bg-cyan-500/30 selection:text-white">
      {/* Dynamic Ambient Aurora Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 left-1/4 w-[750px] h-[750px] bg-cyan-500/22 rounded-full blur-[160px] animate-pulse"
          style={{ animationDuration: '9s' }}
        />
        <div
          className="absolute top-1/3 -right-24 w-[600px] h-[600px] bg-blue-600/22 rounded-full blur-[170px]"
        />
        <div
          className="absolute -bottom-24 left-1/3 w-[650px] h-[650px] bg-teal-400/18 rounded-full blur-[160px]"
        />
      </div>

      {/* Top Navigation Bar (Benchmarked from panoramagenerator.com) */}
      <header className="sticky top-0 z-50 bg-[#040e22]/90 backdrop-blur-2xl border-b border-cyan-500/20 shadow-[0_4px_35px_rgba(0,242,254,0.12)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 relative z-10">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('generator')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative p-2.5 bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-600 rounded-2xl text-slate-950 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-400/60 group-hover:scale-105 transition-all duration-300">
              <Compass className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45 font-bold" />
              <div className="absolute inset-0 rounded-2xl bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  PanoramaAI
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 rounded-md font-bold tracking-wider shadow-sm">
                  STUDIO
                </span>
              </div>
              <div className="text-[10px] text-cyan-300/70 hidden sm:flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F2FE]" />
                <span>AI 360° Panorama &amp; VR Skybox Engine</span>
              </div>
            </div>
          </div>

          {/* Navigation Links with Tools Dropdown */}
          <nav className="flex items-center gap-1 bg-[#06152d]/90 border border-cyan-500/25 p-1.5 rounded-2xl backdrop-blur-xl shadow-inner overflow-visible">
            {/* Tools Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsToolsDropdownOpen(true)}
              onMouseLeave={() => setIsToolsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 text-cyan-200/80 hover:text-white hover:bg-cyan-500/10 transition-colors cursor-pointer"
              >
                <span>Tools</span>
                <ChevronDown className="w-3 h-3 text-cyan-400" />
              </button>

              {/* Tools Dropdown Card */}
              {isToolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#020b18]/95 border border-cyan-400/35 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400/70 px-2 pb-1.5">
                    AI Generators
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('generator');
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/60 text-left flex items-center gap-2 text-xs text-white transition-colors cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                      <div>
                        <div className="font-semibold text-xs">Text to 360 Panorama</div>
                        <div className="text-[10px] text-cyan-300/60">Generate from text description</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('generator');
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/60 text-left flex items-center gap-2 text-xs text-white transition-colors cursor-pointer"
                    >
                      <ImagePlus className="w-3.5 h-3.5 text-teal-400" />
                      <div>
                        <div className="font-semibold text-xs">Image to Pano (Reference)</div>
                        <div className="text-[10px] text-cyan-300/60">Steer with up to 3 photos</div>
                      </div>
                    </button>
                  </div>

                  <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400/70 px-2 pt-3 pb-1 border-t border-cyan-500/15 mt-2">
                    3D &amp; Converters
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('viewer');
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/60 text-left flex items-center gap-2 text-xs text-white transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                      <div>
                        <div className="font-semibold text-xs">360° VR WebGL Viewer</div>
                        <div className="text-[10px] text-cyan-300/60">Inspect, cardboard VR, radar</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('cubemap');
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/60 text-left flex items-center gap-2 text-xs text-white transition-colors cursor-pointer"
                    >
                      <Box className="w-3.5 h-3.5 text-cyan-400" />
                      <div>
                        <div className="font-semibold text-xs">Cubemap 6-Sided Slicer</div>
                        <div className="text-[10px] text-cyan-300/60">Export ZIP for Unity &amp; Unreal</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('globe');
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-cyan-950/60 text-left flex items-center gap-2 text-xs text-white transition-colors cursor-pointer"
                    >
                      <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-xs">3D Planetary Globe</div>
                        <div className="text-[10px] text-cyan-300/60">Orbital sphere with atmosphere</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 fill-current" />
              <span>Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('viewer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'viewer'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-teal-300" />
              <span>360° Viewer</span>
              <span className="text-[9px] px-1 py-0.2 bg-teal-400/25 text-teal-300 rounded font-mono font-bold">
                FREE
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cubemap')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'cubemap'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-cyan-300" />
              <span>Cubemap</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('globe')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'globe'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-teal-300" />
              <span>3D Globe</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-300" />
              <span>Pricing</span>
            </button>
          </nav>

          {/* Right Action Trigger & Free Credits Pill */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-900/60 transition-colors cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>50 Free Credits</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className="shimmer-btn px-4 py-2 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-cyan-400/35 hover:shadow-cyan-400/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Upgrade to Pro</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Canvas / Tab Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 relative z-10">
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

      {/* =========================================================================
          MULTI-COLUMN COMMERCIAL SAAS FOOTER (Benchmarked from panoramagenerator.com)
      ========================================================================= */}
      <footer className="border-t border-cyan-500/20 bg-[#020814]/95 backdrop-blur-2xl py-12 mt-16 text-xs text-cyan-200/70 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-cyan-500/15">
            {/* Col 1: Brand & Bio */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl text-slate-950 font-bold shadow-md shadow-cyan-500/25">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-white font-extrabold text-base tracking-tight">PanoramaAI Studio</span>
              </div>
              <p className="text-xs text-cyan-200/70 leading-relaxed max-w-sm">
                Next-generation artificial intelligence platform for 360° spherical equirectangular panorama synthesis, real-time WebGL inspection, cubemap slicing, and 3D environment pipelines.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-cyan-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Commercial Usage Rights Available on All Paid Plans</span>
              </div>
            </div>

            {/* Col 2: AI Generators & Tools */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">AI Generators</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button type="button" onClick={() => setActiveTab('generator')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                    Text to 360 Panorama
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveTab('generator')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                    Image to 360 (Reference Mode)
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveTab('generator')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                    AI HDRI Skybox Generator
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveTab('viewer')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                    360° WebGL Sphere Viewer
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: 3D Pipelines & Converters */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Converters &amp; 3D</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button type="button" onClick={() => setActiveTab('cubemap')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                    Cubemap 6-Sided Slicer
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setActiveTab('globe')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                    3D Planetary Globe Simulator
                  </button>
                </li>
                <li>
                  <a href="#blender" onClick={(e) => { e.preventDefault(); setActiveTab('cubemap'); }} className="hover:text-cyan-300 transition-colors cursor-pointer">
                    Unity Skybox Export (ZIP)
                  </a>
                </li>
                <li>
                  <a href="#unreal" onClick={(e) => { e.preventDefault(); setActiveTab('generator'); }} className="hover:text-cyan-300 transition-colors cursor-pointer">
                    Radiance .HDR Container
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform & Support */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Company &amp; Legal</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button type="button" onClick={() => setActiveTab('pricing')} className="hover:text-cyan-300 transition-colors cursor-pointer">
                    Pricing &amp; API Plans
                  </button>
                </li>
                <li>
                  <span className="text-cyan-200/50">Terms of Service</span>
                </li>
                <li>
                  <span className="text-cyan-200/50">Privacy Policy</span>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      const pin = prompt('Enter Admin Password:');
                      if (pin === 'admin888') {
                        setActiveTab('admin');
                      } else if (pin !== null) {
                        alert('Incorrect password');
                      }
                    }}
                    className="text-cyan-500 hover:text-cyan-300 text-[11px] transition-colors cursor-pointer"
                  >
                    Admin Console
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-cyan-400/60">
            <div>
              &copy; {new Date().getFullYear()} PanoramaAI Studio. All rights reserved. 2:1 Equirectangular Standard.
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                <Activity className="w-3 h-3 text-teal-400" />
                <span>99.98% Service Uptime</span>
              </span>
              <div className="flex items-center gap-1 text-cyan-300">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Three.js • WebGL 2.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
