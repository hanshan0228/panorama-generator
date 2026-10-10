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
      title: '中央核心观景位',
      description: '全景核心观测点，拥有无遮挡 360° 环视视野。',
    },
    {
      id: 'spot-2',
      lon: -110,
      lat: -8,
      title: '天际线景观位',
      description: '最佳自然光照与全景天际线观测点。',
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
      setEnhanceSuccessMsg('已智能适配为 2:1 等距圆柱全景图。您可随时点击“恢复原图”撤销。');
      setTimeout(() => setEnhanceSuccessMsg(null), 4000);
    };
    img.src = currentPanoramaUrl;
  };

  // Restore original unmodified image
  const handleRestoreOriginal = () => {
    if (originalUploadedUrl) {
      onPanoramaChange(originalUploadedUrl);
      setEnhanceSuccessMsg('已成功恢复至最初上传的原始图片。');
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
        const healed = healPanoramaSeam(canvas, 140);
        onPanoramaChange(healed.toDataURL('image/png'));
        setEnhanceSuccessMsg('360° 接缝已消除：左右边界像素与色调已实现无缝融合！');
        setTimeout(() => setEnhanceSuccessMsg(null), 3500);
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
        setEnhanceSuccessMsg(`4K 超分辨率画质重构完成 (${enhancedCanvas.width} × ${enhancedCanvas.height}px)！`);
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
              ? '地底三脚架盲区已自动修复，并已覆盖 360° 全景底标！'
              : '成功消除地底三脚架盲区与天顶过曝白斑！'
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
      description: newSpotForm.description.trim() || '自定义空间漫游热点',
    };
    setHotspots((prev) => [...prev, newSpot]);
    setNewSpotForm({ title: '', description: '', lon: 0, lat: 0 });
    setShowAddHotspotModal(false);
    setEnhanceSuccessMsg(`漫游热点 "${newSpot.title}" 添加成功！`);
    setTimeout(() => setEnhanceSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>零延迟 WEBGL 渲染引擎</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          在线 360° 全景图交互查看器
        </h1>
        <p className="text-sm text-slate-400">
          即时本地 WebGL 全景播放器，支持平滑阻尼惯性、16x 各向异性过滤与电影级色彩渲染映射。
        </p>
      </div>

      {/* Non-2:1 Aspect Ratio Smart Optimization Helper Banner */}
      {!imageMetadata.is2to1 && (
        <div className="glass-panel border border-amber-500/40 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-200 shadow-xl">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-2xl shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-100 text-sm">
                检测到非 2:1 宽高比全景（当前：{imageMetadata.aspectRatio}）
              </div>
              <p className="text-amber-300/80 text-xs mt-0.5">
                普通平面照片直接映射到 360° 全景球体会产生垂直拉伸失真。请选择推荐展示方案：
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveProjection('curved')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeProjection === 'curved'
                  ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/30 font-extrabold'
                  : 'bg-cyan-950/40 border border-amber-500/30 text-amber-200 hover:bg-cyan-900/40'
              }`}
            >
              <Tv className="w-4 h-4 text-cyan-300" />
              <span>180° 环幕巨幕</span>
            </button>

            <button
              type="button"
              onClick={handleAutoFitToEquirectangular}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 rounded-xl font-extrabold flex items-center gap-1.5 shadow-lg shadow-cyan-400/25 transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>智能转为 2:1 全景</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className="glass-panel border border-cyan-500/25 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,10,30,0.7)]">
        {/* Top Control Strip */}
        <div className="px-5 py-3.5 bg-[#030e20]/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white flex items-center gap-2 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F2FE]" />
              360° 交互式全景视口
            </span>
            <div className="hidden sm:flex items-center gap-2 text-cyan-300/70 font-mono text-[11px]">
              <span className="px-2 py-0.5 bg-cyan-950/60 rounded-md border border-cyan-500/20">{imageMetadata.width} × {imageMetadata.height}px</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-md border ${
                imageMetadata.is2to1
                  ? 'bg-teal-500/15 border-teal-400/30 text-teal-300 font-bold'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300 font-bold'
              }`}>
                比例: {imageMetadata.aspectRatio}
              </span>
            </div>
          </div>

          {/* Quick upload & optimization triggers */}
          <div className="flex items-center gap-2">
            {originalUploadedUrl && originalUploadedUrl !== currentPanoramaUrl && (
              <button
                type="button"
                onClick={handleRestoreOriginal}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 rounded-xl cursor-pointer flex items-center gap-1.5 font-bold transition-colors shadow-sm"
                title="撤销修改并恢复您最初上传的原图"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>恢复原图</span>
              </button>
            )}

            <button
              type="button"
              disabled={isUpscaling}
              onClick={handleUpscaleEnhance}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 rounded-xl cursor-pointer flex items-center gap-1.5 font-extrabold transition-all shadow-md shadow-cyan-400/25 disabled:opacity-60 active:scale-95"
              title="使用反锐化掩模与超分辨率重构提升至 4K 画质"
            >
              {isUpscaling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>4K增强中...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                  <span>4K超分增强</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleHealSeam}
              className="px-3 py-1.5 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/25 text-cyan-200 rounded-xl cursor-pointer flex items-center gap-1.5 font-bold transition-all"
              title="消除垂直边界接缝，实现水平 360° 无缝旋转"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>消除接缝</span>
            </button>

            {/* Nadir / Zenith Pole Repair & Logo Disc */}
            <div className="relative group/pole">
              <button
                type="button"
                disabled={isRepairingPoles}
                onClick={() => handleRepairPoles(false)}
                className="px-3 py-1.5 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/25 text-cyan-200 rounded-xl cursor-pointer flex items-center gap-1.5 font-bold transition-all disabled:opacity-60"
                title="智能消除地底三脚架盲区 (-90°) 与天顶太阳穿帮 (+90°)"
              >
                {isRepairingPoles ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>极点修复中...</span>
                  </>
                ) : (
                  <>
                    <Disc className="w-3.5 h-3.5 text-amber-400" />
                    <span>极点修复</span>
                  </>
                )}
              </button>
              <div className="hidden group-hover/pole:block absolute top-full right-0 mt-1.5 z-30 glass-panel border border-cyan-500/30 rounded-2xl p-2 shadow-2xl min-w-[220px]">
                <button
                  type="button"
                  onClick={() => handleRepairPoles(false)}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-500/15 rounded-xl text-xs text-cyan-200 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>自动消除天顶/地底</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRepairPoles(true)}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-500/15 rounded-xl text-xs text-cyan-200 flex items-center gap-2 cursor-pointer border-t border-cyan-500/20 mt-1 transition-colors"
                >
                  <Disc className="w-3.5 h-3.5 text-teal-400" />
                  <span>添加 360° 地底遮标</span>
                </button>
              </div>
            </div>

            <label className="shimmer-btn px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl cursor-pointer flex items-center gap-1.5 font-extrabold transition-all shadow-md shadow-cyan-400/30 active:scale-95">
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>打开本地全景</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Success toast notification */}
        {enhanceSuccessMsg && (
          <div className="px-5 py-2.5 bg-teal-500/15 border-b border-teal-400/30 text-teal-300 text-xs flex items-center gap-2 animate-fadeIn font-bold">
            <Check className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{enhanceSuccessMsg}</span>
          </div>
        )}

        {/* 360 WebGL Canvas */}
        <div className="h-[520px] w-full bg-[#020712] relative">
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
          <div className="px-5 py-3 bg-[#030e20]/95 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>当前正在显示增强/重构后的全景纹理。</span>
            </div>
            <button
              type="button"
              onClick={handleRestoreOriginal}
              className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢复最初上传的原图</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Hotspots Tour Management Panel */}
      <div className="glass-panel border border-cyan-500/25 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/15 text-cyan-400 rounded-2xl border border-cyan-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>360° 空间交互漫游热点</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-cyan-400/20 text-cyan-300 rounded-full border border-cyan-400/40">
                  {hotspots.length} 个热点
                </span>
              </div>
              <p className="text-xs text-cyan-300/70 mt-0.5">
                在三维空间中自由放置注释标签、信息卡片与导航标记。点击视口右上角的图钉按钮可快速标注。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddHotspotModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-400/25 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>添加空间热点</span>
            </button>
            {hotspots.length > 0 && (
              <button
                type="button"
                onClick={() => setHotspots([])}
                className="p-2 bg-cyan-950/40 hover:bg-red-500/20 border border-cyan-500/20 hover:border-red-500/40 text-cyan-300/70 hover:text-red-300 rounded-xl text-xs transition-colors cursor-pointer"
                title="清空所有热点"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Hotspots Grid Cards */}
        {hotspots.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-cyan-500/20 rounded-2xl text-cyan-400/60 text-xs">
            暂无空间热点。点击上方“添加空间热点”或在 360° 视口中使用图钉工具标记空间场景。
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {hotspots.map((spot) => (
              <div
                key={spot.id}
                className="glass-card p-3.5 rounded-2xl flex items-start justify-between gap-2.5 text-xs group"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="font-bold text-cyan-100 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{spot.title}</span>
                  </div>
                  <p className="text-[11px] text-cyan-300/70 line-clamp-2">{spot.description}</p>
                  <div className="text-[10px] text-cyan-400/60 font-mono">
                    经度: {spot.lon.toFixed(1)}° • 纬度: {spot.lat.toFixed(1)}°
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHotspots((prev) => prev.filter((h) => h.id !== spot.id))}
                  className="p-1.5 text-cyan-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="删除此热点"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel border border-cyan-400/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>添加场景空间热点</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHotspotModal(false)}
                className="w-7 h-7 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAddHotspot} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-cyan-200 font-semibold mb-1">热点标题</label>
                <input
                  type="text"
                  required
                  placeholder="例如：主卧视角、大堂入口、阳台全景"
                  value={newSpotForm.title}
                  onChange={(e) => setNewSpotForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-1">描述与空间导览说明</label>
                <textarea
                  rows={2}
                  placeholder="输入场景说明、空间标注或语音导览说明..."
                  value={newSpotForm.description}
                  onChange={(e) => setNewSpotForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyan-300/80 mb-1 font-medium">水平旋转角 / 经度 (-180° ~ 180°)</label>
                  <input
                    type="number"
                    min={-180}
                    max={180}
                    step={1}
                    value={newSpotForm.lon}
                    onChange={(e) => setNewSpotForm((p) => ({ ...p, lon: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-cyan-300/80 mb-1 font-medium">俯仰角 / 纬度 (-90° ~ 90°)</label>
                  <input
                    type="number"
                    min={-90}
                    max={90}
                    step={1}
                    value={newSpotForm.lat}
                    onChange={(e) => setNewSpotForm((p) => ({ ...p, lat: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2 bg-[#030a17] border border-cyan-500/30 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-cyan-500/20">
                <button
                  type="button"
                  onClick={() => setShowAddHotspotModal(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-slate-300 rounded-xl cursor-pointer transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black rounded-xl shadow-lg shadow-cyan-400/25 cursor-pointer active:scale-95 transition-all"
                >
                  保存空间热点
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
          className="md:col-span-7 glass-panel border-2 border-dashed border-cyan-400/30 hover:border-cyan-400 rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3.5 cursor-pointer group shadow-xl hover:shadow-[0_0_40px_rgba(0,242,254,0.25)]"
        >
          <label className="cursor-pointer flex flex-col items-center space-y-2.5">
            <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all duration-300 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
              <Upload className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="text-base font-extrabold text-white tracking-tight">
              拖拽 360° 全景图到此处，或 <span className="text-cyan-400 underline decoration-cyan-400/50 underline-offset-4">浏览本地文件</span>
            </div>
            <p className="text-xs text-cyan-200/70">支持标准 2:1 等距圆柱全景图（JPG、PNG、WebP、HDR）</p>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#030d1e] border border-cyan-500/25 rounded-full text-[11px] text-cyan-200 shadow-inner">
            <ClipboardPaste className="w-3.5 h-3.5 text-cyan-400" />
            <span>快捷提示：直接按键盘 <kbd className="px-2 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-300 font-mono font-bold shadow-sm">Ctrl + V</kbd> 即可直接粘贴剪贴板全景图</span>
          </div>
        </div>

        {/* Preset Sample Gallery */}
        <div className="md:col-span-5 glass-panel border border-cyan-500/25 rounded-3xl p-6 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              体验精选 360° 全景示例
            </span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
              一键载入
            </span>
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
                className="w-full px-3.5 py-2.5 glass-card rounded-2xl text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-cyan-100 group-hover:text-cyan-300 transition-colors">
                    {preset.title}
                  </div>
                  <div className="text-[10px] text-cyan-300/60 truncate max-w-[220px]">
                    {preset.description}
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-400/60 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all">
                  载入 →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Magnet Call-to-Action */}
      <div className="glass-panel relative overflow-hidden bg-gradient-to-r from-cyan-950/80 via-[#0a2347] to-[#041026] border border-cyan-400/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[0_20px_50px_rgba(0,242,254,0.18)]">
        <div className="space-y-1.5 text-center sm:text-left relative z-10">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 fill-current" />
            <h2 className="text-base font-black text-white tracking-tight">需要生成全新 360° 虚拟场景或定制天空盒？</h2>
          </div>
          <p className="text-xs text-cyan-200/80">
            使用我们的 AI 全景工坊，只需一句简单中文描述，30 秒即可生成无缝 360° VR 场景。
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('generator')}
          className="shimmer-btn px-6 py-3 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-400/35 transition-all shrink-0 cursor-pointer active:scale-95 tracking-wide"
        >
          立即体验 AI 全景生成
        </button>
      </div>

      {/* SEO Educational Guide */}
      <div className="border-t border-white/[0.08] pt-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          技术规格与兼容性说明
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="glass-card p-4 rounded-2xl space-y-1.5">
            <div className="font-semibold text-slate-200">等距柱状全景标准 (2:1)</div>
            <p className="text-[11px] leading-relaxed">
              标准 2:1 画面比例（水平 360° × 垂直 180°）。原生兼容主流全景相机（影石 Insta360、GoPro MAX、理光 Theta 等）。
            </p>
          </div>
          <div className="glass-card p-4 rounded-2xl space-y-1.5">
            <div className="font-semibold text-slate-200">纯本地浏览器隐私处理</div>
            <p className="text-[11px] leading-relaxed">
              所有全景图片均直接在您的本地浏览器端通过 WebGL 硬件加速处理，无需上传云端，零隐私泄漏风险。
            </p>
          </div>
          <div className="glass-card p-4 rounded-2xl space-y-1.5">
            <div className="font-semibold text-slate-200">游戏引擎与 VR 头显就绪</div>
            <p className="text-[11px] leading-relaxed">
              无缝兼容 Unity、Unreal Engine 5 (UE5)、Blender 环境贴图、WebXR、Three.js 以及 Meta Quest VR 头显设备。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
