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

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#040e22]/85 backdrop-blur-2xl border-b border-cyan-500/20 shadow-[0_4px_35px_rgba(0,242,254,0.1)]">
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
                  工作室
                </span>
              </div>
              <div className="text-[10px] text-cyan-300/70 hidden sm:flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F2FE]" />
                <span>AI 360° 全景漫游与天空盒引擎</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <nav className="flex items-center gap-1 bg-[#06152d]/90 border border-cyan-500/25 p-1.5 rounded-2xl backdrop-blur-xl shadow-inner overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 fill-current" />
              <span>AI 全景生成</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('viewer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'viewer'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-teal-300" />
              <span>360° 全景漫游</span>
              <span className="text-[9px] px-1 py-0.2 bg-teal-400/25 text-teal-300 rounded font-mono font-bold">
                免费
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cubemap')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'cubemap'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-cyan-300" />
              <span>立方体切片</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('globe')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'globe'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-teal-300" />
              <span>全景地球仪</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/35 font-extrabold'
                  : 'text-cyan-200/70 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-300" />
              <span>会员与价格</span>
            </button>
          </nav>

          {/* Right Action Trigger */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className="shimmer-btn px-4 py-2 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-cyan-400/35 hover:shadow-cyan-400/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>升级专业版</span>
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

      {/* Modern Oceanic Studio Footer */}
      <footer className="border-t border-cyan-500/15 bg-[#030915]/90 backdrop-blur-xl py-8 mt-12 text-xs text-cyan-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="text-white font-bold tracking-tight">PanoramaAI 全景工作室</span>
            <span className="text-cyan-800">•</span>
            <span className="text-cyan-300/80">工业级等距柱状 360° 全景生产管线</span>
          </div>

          <div className="flex items-center gap-4 text-cyan-200/70 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('viewer')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              360° 全景预览
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cubemap')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              天空盒切片
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('globe')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              全景地球仪
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              套餐价格与 API
            </button>
            <button
              type="button"
              onClick={() => {
                const pin = prompt('请输入管理员密码：');
                if (pin === 'admin888') {
                  setActiveTab('admin');
                } else if (pin !== null) {
                  alert('密码错误');
                }
              }}
              className="text-cyan-800 hover:text-cyan-600 text-[10px] transition-colors cursor-pointer"
            >
              管理后台
            </button>
          </div>

          <div className="flex items-center gap-3 text-cyan-400/60">
            <span className="flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
              <Activity className="w-3 h-3 text-teal-400" />
              <span>WebGL 3D 渲染就绪</span>
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Three.js • 2:1 等距柱状投影</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
