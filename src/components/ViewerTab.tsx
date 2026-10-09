import { useState, useEffect } from 'react';
import {
  Upload,
  ClipboardPaste,
  Sparkles,
  Info,
  ImageIcon,
  AlertCircle,
  Tv,
  Wand2,
  Zap,
  Check,
  RefreshCw,
  RotateCcw,
  Disc,
  MapPin,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SphereViewer } from './SphereViewer';
import { PRESET_PANORAMAS, generateProceduralPanorama } from '../utils/proceduralPanoramas';
import { convertFlatPhotoToEquirectangular } from '../utils/imageOptimizer';
import { healPanoramaSeam } from '../utils/seamHealer';
import { enhanceAndUpscalePanorama } from '../utils/imageEnhancer';
import { repairPanoramaPoles } from '../utils/poleRepair';
import type { ActiveTab, ViewerProjectionMode, PanoramaHotspot } from '../types/panorama';

interface ViewerTabProps {
  currentPanoramaUrl: string;
  onPanoramaChange: (url: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export function ViewerTab({
  currentPanoramaUrl,
  onPanoramaChange,
  onNavigateTab,
}: ViewerTabProps) {
  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    aspectRatio: string;
    is2to1: boolean;
  }>({
    width: 2048,
    height: 1024,
    aspectRatio: '2:1',
    is2to1: true,
  });

  const [activeProjection, setActiveProjection] = useState<ViewerProjectionMode>('sphere');
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isRepairingPoles, setIsRepairingPoles] = useState(false);
  const [enhanceSuccessMsg, setEnhanceSuccessMsg] = useState<string | null>(null);
  const [originalUploadedUrl, setOriginalUploadedUrl] = useState<string | null>(null);

  // Interactive Scene Hotspots Tour state
  const [hotspots, setHotspots] = useState<PanoramaHotspot[]>([
    {
      id: 'spot-1',
      lon: 35,
      lat: 5,
      title: 'Main Hub',
      description: 'Core observation point with unobstructed 360 view.',
    },
    {
      id: 'spot-2',
      lon: -110,
      lat: -8,
      title: 'Scenic Vantage Point',
      description: 'Optimal natural illumination and panoramic skyline.',
    },
  ]);
  const [showAddHotspotModal, setShowAddHotspotModal] = useState(false);
  const [newSpotForm, setNewSpotForm] = useState({
    title: '',
    description: '',
    lon: 0,
    lat: 0,
  });

  // Calculate metadata whenever panorama URL changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      const ratio = (w / h).toFixed(2);
      const isStandard = Math.abs(w / h - 2) < 0.1;

      setImageMetadata({
        width: w,
        height: h,
        aspectRatio: `${ratio}:1`,
        is2to1: isStandard,
      });

      // If user uploaded a non-2:1 photo, automatically suggest or switch to curved mode
      if (!isStandard) {
        setActiveProjection('curved');
      } else {
        setActiveProjection('sphere');
      }
    };
    img.src = currentPanoramaUrl;
  }, [currentPanoramaUrl]);

  // Handle Ctrl+V clipboard paste (benchmarked from 360photocam.com)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                const url = event.target.result as string;
                setOriginalUploadedUrl(url);
                onPanoramaChange(url);
              }
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onPanoramaChange]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setOriginalUploadedUrl(url);
          onPanoramaChange(url);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setOriginalUploadedUrl(url);
          onPanoramaChange(url);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert non-2:1 flat photo into a clean 2:1 equirectangular image
  const handleAutoFitToEquirectangular = () => {
    // Save original image if not yet saved
    if (!originalUploadedUrl) {
      setOriginalUploadedUrl(currentPanoramaUrl);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = convertFlatPhotoToEquirectangular(img, 2048);
      const dataUrl = canvas.toDataURL('image/png');
      onPanoramaChange(dataUrl);
      setActiveProjection('sphere');
      setEnhanceSuccessMsg('Fitted to 2:1 equirectangular panorama. Click "Restore Original" anytime to undo.');
      setTimeout(() => setEnhanceSuccessMsg(null), 4000);
    };
    img.src = currentPanoramaUrl;
  };

  // Restore original unmodified image
  const handleRestoreOriginal = () => {
    if (originalUploadedUrl) {
      onPanoramaChange(originalUploadedUrl);
      setEnhanceSuccessMsg('Successfully restored to original uploaded image.');
      setTimeout(() => setEnhanceSuccessMsg(null), 3500);
    }
  };

  // Seam healing on demand for uploaded images
  const handleHealSeam = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const healed = healPanoramaSeam(canvas, 80);
        onPanoramaChange(healed.toDataURL('image/png'));
      }
    };
    img.src = currentPanoramaUrl;
  };

  // 4K Clarity Upscaling and Sharpening on demand
  const handleUpscaleEnhance = () => {
    setIsUpscaling(true);
    setTimeout(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const enhancedCanvas = enhanceAndUpscalePanorama(img, {
          scaleFactor: 2,
          sharpness: 0.75,
          contrastBoost: 1.1,
        });
        const dataUrl = enhancedCanvas.toDataURL('image/png');
        onPanoramaChange(dataUrl);
        setIsUpscaling(false);
        setEnhanceSuccessMsg(`4K super-resolution enhancement complete (${enhancedCanvas.width} × ${enhancedCanvas.height}px)!`);
        confetti({ particleCount: 35, spread: 55, origin: { y: 0.65 } });
        setTimeout(() => setEnhanceSuccessMsg(null), 3500);
      };
      img.src = currentPanoramaUrl;
    }, 120);
  };

  // Ground Tripod & Sky Zenith Pole Repair
  const handleRepairPoles = (addLogoDisc: boolean = false) => {
    if (!originalUploadedUrl) {
      setOriginalUploadedUrl(currentPanoramaUrl);
    }
    setIsRepairingPoles(true);
    setTimeout(() => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const repaired = repairPanoramaPoles(canvas, {
            repairNadir: true,
            repairZenith: true,
            nadirRadiusRatio: 0.12,
            zenithRadiusRatio: 0.08,
            addLogoDisc,
            discLabel: '360° VR PANORAMA',
          });
          onPanoramaChange(repaired.toDataURL('image/png'));
          setEnhanceSuccessMsg(
            addLogoDisc
              ? 'Nadir tripod hole healed and custom 360° nadir disc applied!'
              : 'Successfully erased nadir tripod hole and zenith blowout!'
          );
          confetti({ particleCount: 35, spread: 55, origin: { y: 0.65 } });
          setTimeout(() => setEnhanceSuccessMsg(null), 3500);
        }
        setIsRepairingPoles(false);
      };
      img.src = currentPanoramaUrl;
    }, 120);
  };

  const handleManualAddHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotForm.title.trim()) return;
    const newSpot: PanoramaHotspot = {
      id: `spot-${Date.now()}`,
      lon: Number(newSpotForm.lon) || 0,
      lat: Number(newSpotForm.lat) || 0,
      title: newSpotForm.title.trim(),
      description: newSpotForm.description.trim() || 'Custom point of interest',
    };
    setHotspots((prev) => [...prev, newSpot]);
    setNewSpotForm({ title: '', description: '', lon: 0, lat: 0 });
    setShowAddHotspotModal(false);
    setEnhanceSuccessMsg(`Tour hotspot "${newSpot.title}" added successfully!`);
    setTimeout(() => setEnhanceSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Free Online 360° Panorama Viewer
        </h1>
        <p className="text-sm text-slate-400">
          Instant client-side WebGL player with smooth damping inertia, 16x anisotropic filtering, and ACES Filmic color rendering.
        </p>
      </div>

      {/* Non-2:1 Aspect Ratio Smart Optimization Helper Banner */}
      {!imageMetadata.is2to1 && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-200 shadow-lg">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-amber-100">
                Non-2:1 Aspect Ratio Detected (Current: {imageMetadata.aspectRatio})
              </div>
              <p className="text-amber-300/80 text-[11px] mt-0.5">
                Mapping standard flat photos directly onto a 360° sphere causes vertical distortion. Choose a recommended display mode:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveProjection('curved')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeProjection === 'curved'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-900 border border-amber-500/30 text-amber-200 hover:bg-slate-800'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>180° Curved Screen (Recommended)</span>
            </button>

            <button
              type="button"
              onClick={handleAutoFitToEquirectangular}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Smart Convert to 2:1 Panorama</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Control Strip */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Interactive Panorama Canvas
            </span>
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <span>{imageMetadata.width} × {imageMetadata.height}px</span>
              <span>•</span>
              <span className={imageMetadata.is2to1 ? 'text-emerald-400' : 'text-amber-400 font-medium'}>
                Ratio: {imageMetadata.aspectRatio}
              </span>
            </div>
          </div>

          {/* Quick upload & optimization triggers */}
          <div className="flex items-center gap-2">
            {originalUploadedUrl && originalUploadedUrl !== currentPanoramaUrl && (
              <button
                type="button"
                onClick={handleRestoreOriginal}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 rounded-lg cursor-pointer flex items-center gap-1.5 font-medium transition-colors shadow-sm"
                title="Revert modifications and restore your original uploaded photo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Original</span>
              </button>
            )}

            <button
              type="button"
              disabled={isUpscaling}
              onClick={handleUpscaleEnhance}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg cursor-pointer flex items-center gap-1.5 font-medium transition-all shadow-sm disabled:opacity-60"
              title="Sharpen and upscale resolution up to 4K using unsharp masking"
            >
              {isUpscaling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Upscaling to 4K...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>4K Upscale</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleHealSeam}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer flex items-center gap-1.5 font-medium transition-colors"
              title="Heal vertical boundary seam for smooth horizontal 360 rotation"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Heal Seam</span>
            </button>

            {/* Nadir / Zenith Pole Repair & Logo Disc */}
            <div className="relative group/pole">
              <button
                type="button"
                disabled={isRepairingPoles}
                onClick={() => handleRepairPoles(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer flex items-center gap-1.5 font-medium transition-colors disabled:opacity-60"
                title="Inpaint tripod hole at nadir (-90°) and zenith sun hole (+90°)"
              >
                {isRepairingPoles ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Repairing...</span>
                  </>
                ) : (
                  <>
                    <Disc className="w-3.5 h-3.5 text-amber-400" />
                    <span>Repair Poles</span>
                  </>
                )}
              </button>
              <div className="hidden group-hover/pole:block absolute top-full right-0 mt-1 z-30 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl min-w-[210px]">
                <button
                  type="button"
                  onClick={() => handleRepairPoles(false)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-lg text-xs text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inpaint Nadir Tripod &amp; Zenith Hole</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRepairPoles(true)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 rounded-lg text-xs text-slate-200 flex items-center gap-2 cursor-pointer border-t border-slate-800/80 mt-1"
                >
                  <Disc className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Apply 360° Nadir Cap Disc</span>
                </button>
              </div>
            </div>

            <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer flex items-center gap-1.5 font-medium transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Open Local File</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Success toast notification */}
        {enhanceSuccessMsg && (
          <div className="px-5 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{enhanceSuccessMsg}</span>
          </div>
        )}

        {/* 360 WebGL Canvas */}
        <div className="h-[520px] w-full bg-slate-950">
          <SphereViewer
            textureUrl={currentPanoramaUrl}
            projectionMode={activeProjection}
            className="w-full h-full"
            hotspots={hotspots}
            onAddHotspot={(spot) => setHotspots((prev) => [...prev, spot])}
            onRemoveHotspot={(id) => setHotspots((prev) => prev.filter((h) => h.id !== id))}
          />
        </div>

        {/* Restore Original Image Status Footer */}
        {originalUploadedUrl && originalUploadedUrl !== currentPanoramaUrl && (
          <div className="px-5 py-2.5 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Displaying enhanced/reconstructed texture.</span>
            </div>
            <button
              type="button"
              onClick={handleRestoreOriginal}
              className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revert to Original Upload</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Hotspots Tour Management Panel */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Interactive Tour Hotspots</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">
                  {hotspots.length} {hotspots.length === 1 ? 'Point' : 'Points'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Place spatial annotations, info cards, and navigation pins in 360° space. You can also click the Pin button on the top-right of the viewer to add points.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddHotspotModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Hotspot</span>
            </button>
            {hotspots.length > 0 && (
              <button
                type="button"
                onClick={() => setHotspots([])}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                title="Clear all hotspots"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hotspots Grid Cards */}
        {hotspots.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No hotspots added yet. Click &quot;Add Hotspot&quot; above or use the Pin icon on the 360° viewer to annotate the scene.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {hotspots.map((spot) => (
              <div
                key={spot.id}
                className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-start justify-between gap-2 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{spot.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{spot.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Lon: {spot.lon.toFixed(1)}° • Lat: {spot.lat.toFixed(1)}°
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHotspots((prev) => prev.filter((h) => h.id !== spot.id))}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Delete hotspot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Hotspot Modal */}
      {showAddHotspotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Add Scene Hotspot</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHotspotModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAddHotspot} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Hotspot Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom, Main Entrance, Balcony View"
                  value={newSpotForm.title}
                  onChange={(e) => setNewSpotForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description &amp; Navigation Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter annotations, spatial context, or audio/tour notes..."
                  value={newSpotForm.description}
                  onChange={(e) => setNewSpotForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Yaw / Longitude (-180° ~ 180°)</label>
                  <input
                    type="number"
                    min={-180}
                    max={180}
                    step={1}
                    value={newSpotForm.lon}
                    onChange={(e) => setNewSpotForm((p) => ({ ...p, lon: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pitch / Latitude (-90° ~ 90°)</label>
                  <input
                    type="number"
                    min={-90}
                    max={90}
                    step={1}
                    value={newSpotForm.lat}
                    onChange={(e) => setNewSpotForm((p) => ({ ...p, lat: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHotspotModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-md cursor-pointer"
                >
                  Save Hotspot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Zone & Quick Sample Picker Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Dropzone with Ctrl+V hint */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="md:col-span-7 border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-slate-900/40 rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer group"
        >
          <label className="cursor-pointer flex flex-col items-center space-y-2">
            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-200">
              Drag &amp; Drop 360° Photo Here, or <span className="text-indigo-400 underline">Browse</span>
            </div>
            <p className="text-xs text-slate-400">Supports standard 2:1 Equirectangular JPG, PNG, WebP</p>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/60 rounded-full text-[11px] text-slate-300">
            <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pro Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-100 font-mono">Ctrl + V</kbd> to paste directly from clipboard</span>
          </div>
        </div>

        {/* Preset Sample Gallery */}
        <div className="md:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              Try Ready-Made 360° Panoramas
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1-CLICK DEMO</span>
          </div>

          <div className="space-y-2">
            {PRESET_PANORAMAS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  const canvas = generateProceduralPanorama(preset.id, preset.prompt, 2048, 1024);
                  onPanoramaChange(canvas.toDataURL('image/png'));
                }}
                className="w-full px-3 py-2 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-300">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                    {preset.description}
                  </div>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-indigo-400">Load</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Magnet Call-to-Action */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h2 className="text-sm font-semibold text-white">Need new 360° environments or custom skyboxes?</h2>
          </div>
          <p className="text-xs text-slate-400">
            Use our AI Panorama Studio to generate seamless VR environments from simple text prompts in 30 seconds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('generator')}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-500/20 transition-all shrink-0 cursor-pointer"
        >
          Generate with AI Now
        </button>
      </div>

      {/* SEO Educational Guide */}
      <div className="border-t border-slate-800/80 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          Technical Specifications &amp; Compatibility
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
            <div className="font-semibold text-slate-200">Equirectangular Standard</div>
            <p className="text-[11px] leading-relaxed">
              Standard 2:1 aspect ratio projection (360° horizontal × 180° vertical). Compatible with all major 360 camera rigs (Insta360, GoPro MAX, Ricoh Theta).
            </p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
            <div className="font-semibold text-slate-200">Client-Side Privacy</div>
            <p className="text-[11px] leading-relaxed">
              Your images are processed purely inside your local browser via WebGL. No files are transmitted to any remote server or stored in the cloud.
            </p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
            <div className="font-semibold text-slate-200">Game &amp; VR Ready</div>
            <p className="text-[11px] leading-relaxed">
              Export ready for Unity, Unreal Engine 5, Blender World Background, WebXR, Three.js, and Meta Quest headsets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
