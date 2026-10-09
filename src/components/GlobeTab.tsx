import { useState } from 'react';
import {
  Globe2,
  Upload,
  Info,
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
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2.5">
          <Globe2 className="w-7 h-7 text-emerald-400" />
          <span>Interactive 3D Photo to Globe Generator</span>
        </h1>
        <p className="text-sm text-slate-400">
          Wrap any 2:1 equirectangular map, panoramic photo, or custom artwork onto an orbital 3D spinning planet with atmospheric glow.
        </p>
      </div>

      {/* Main 3D Globe Viewer Viewport */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            3D Planetary Orbit Simulator
          </span>

          <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer flex items-center gap-1.5 font-medium transition-colors">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wrap Custom Map Image</span>
            <input type="file" accept="image/*" onChange={handleCustomUpload} className="hidden" />
          </label>
        </div>

        <div className="h-[520px] w-full bg-slate-950">
          <GlobeViewer textureUrl={activeGlobeTexture} className="w-full h-full" />
        </div>
      </div>

      {/* Quick Texture Switcher Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-white">Current Texture Source</div>
          <div className="text-[11px] text-slate-400">
            Click &apos;Reset to Active Panorama&apos; to sync with your current 360 AI generation.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveGlobeTexture(currentPanoramaUrl)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
        >
          Sync with Active 360 Panorama
        </button>
      </div>

      {/* Educational & Technical Guidance */}
      <div className="border-t border-slate-800/80 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          Cartography &amp; Spherical UV Mapping
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
            <div className="font-semibold text-slate-200">Equirectangular UV Projection</div>
            <p className="text-[11px] leading-relaxed">
              Standard cylindrical projection maps longitude directly to the X-axis (0° to 360°) and latitude to the Y-axis (-90° to +90°). Perfect for fantasy world maps, educational astronomy, and sci-fi worldbuilding.
            </p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
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
