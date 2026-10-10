import { useState } from 'react';
import {
  Globe2,
  Upload,
  Info,
  RotateCcw,
} from 'lucide-react';
import { GlobeViewer } from './GlobeViewer';

interface GlobeTabProps {
  currentPanoramaUrl: string;
}

export function GlobeTab({ currentPanoramaUrl }: GlobeTabProps) {
  const [activeGlobeTexture, setActiveGlobeTexture] = useState<string>(currentPanoramaUrl);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setActiveGlobeTexture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-1">
          <Globe2 className="w-3.5 h-3.5" />
          <span>菲涅尔大气辉光着色器</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          交互式 3D 全景行星地球仪
        </h1>
        <p className="text-sm text-slate-400">
          将任意 2:1 等距圆柱全景、照片或世界地图贴附在带轨道自转与大气散射的 3D 行星球体上。
        </p>
      </div>

      {/* Main 3D Globe Viewer Viewport */}
      <div className="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="px-5 py-3.5 bg-[#080b18]/90 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            3D 行星自转与轨道模拟器
          </span>

          <label className="shimmer-btn px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl cursor-pointer flex items-center gap-1.5 font-semibold transition-all shadow-md shadow-cyan-600/20 active:scale-95">
            <Upload className="w-3.5 h-3.5" />
            <span>加载自定义地图贴图</span>
            <input type="file" accept="image/*" onChange={handleCustomUpload} className="hidden" />
          </label>
        </div>

        <div className="h-[520px] w-full bg-[#05070e] relative">
          <GlobeViewer textureUrl={activeGlobeTexture} className="w-full h-full" />
        </div>
      </div>

      {/* Quick Texture Switcher Bar */}
      <div className="glass-panel border border-white/10 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="text-sm font-bold text-white">当前球体贴图源</div>
          <div className="text-xs text-slate-400">
            点击“同步当前 360° 全景图”将最新 AI 生成或查看的全景直接映射到 3D 地球仪。
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveGlobeTexture(currentPanoramaUrl)}
          className="px-4 py-2 bg-white/[0.06] hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>同步当前 360° 全景图</span>
        </button>
      </div>

      {/* Educational & Technical Guidance */}
      <div className="border-t border-white/[0.08] pt-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          制图投影与球面 UV 映射原理
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="glass-card p-4 rounded-2xl space-y-1.5">
            <div className="font-semibold text-slate-200">等距柱状 UV 纹理映射</div>
            <p className="text-[11px] leading-relaxed">
              标准圆柱投影将经度直接映射到 X 轴（0° ~ 360°），纬度映射到 Y 轴（-90° ~ +90°）。完美适配架空世界地图、天文科普教学与科幻世界观构建。
            </p>
          </div>
          <div className="glass-card p-4 rounded-2xl space-y-1.5">
            <div className="font-semibold text-slate-200">轨道大气层菲涅尔散射</div>
            <p className="text-[11px] leading-relaxed">
              内置模拟菲涅尔大气边缘辉光与瑞利散射，在球体边缘呈现深邃的行星光晕，效果比肩高规格实时太空渲染。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
