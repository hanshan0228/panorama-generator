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
          <span>FRESNEL ATMOSPHERE SHADER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Interactive 3D Photo to Globe Generator
        </h1>
        <p className="text-sm text-slate-400">
          Wrap any 2:1 equirectangular map, panoramic photo, or custom artwork onto an orbital 3D spinning planet with atmospheric glow.
        </p>
      </div>

      {/* Main 3D Globe Viewer Viewport */}
      <div className="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="px-5 py-3.5 bg-[#080b18]/90 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            3D Planetary Orbit Simulator
          </span>

          <label className="shimmer-btn px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl cursor-pointer flex items-center gap-1.5 font-semibold transition-all shadow-md shadow-cyan-600/20 active:scale-95">
            <Upload className="w-3.5 h-3.5" />
            <span>Wrap Custom Map Image</span>
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
          <div className="text-sm font-bold text-white">Current Texture Source</div>
          <div className="text-xs text-slate-400">
            Click &apos;Sync with Active 360 Panorama&apos; to map your latest AI generation onto the 3D globe.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveGlobeTexture(currentPanoramaUrl)}
          className="px-4 py-2 bg-white/[0.06] hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sync with Active 360 Panorama</span>
        </button>
      </div>

      {/* Educational & Technical Guidance */}
      <div className="border-t border-white/[0.08] pt-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          Cartography &amp; Spherical UV Mapping
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="glass-card p-4 rounded-2xl space-y-1.5">
            <div className="font-semibold text-slate-200">Equirectangular UV Projection</div>
            <p className="text-[11px] leading-relaxed">
              Standard cylindrical projection maps longitude directly to the X-axis (0° to 360°) and latitude to the Y-axis (-90° to +90°). Perfect for fantasy world maps, educational astronomy, and sci-fi worldbuilding.
            </p>
          </div>
          <div className="glass-card p-4 rounded-2xl space-y-1.5">
            <div className="font-semibold text-slate-200">Orbital Atmospheric Shader</div>
            <p className="text-[11px] leading-relaxed">
              Equipped with a simulated Fresnel atmospheric glow scattering rayleigh-blue light around the planetary limb, identical to high-end real-time space simulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
