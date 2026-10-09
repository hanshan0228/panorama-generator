import { useState, useEffect } from 'react';
import {
  Box,
  Download,
  Archive,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import JSZip from 'jszip';
import type { CubemapFace } from '../types/panorama';
import { sliceEquirectangularToCubemap } from '../utils/cubemapSlicer';

interface CubemapTabProps {
  currentPanoramaUrl: string;
}

export function CubemapTab({ currentPanoramaUrl }: CubemapTabProps) {
  const [faceSize, setFaceSize] = useState<number>(512);
  const [faces, setFaces] = useState<CubemapFace[]>([]);
  const [isSlicing, setIsSlicing] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Automatically slice into cubemap whenever panorama or faceSize changes
  useEffect(() => {
    setIsSlicing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const sliced = sliceEquirectangularToCubemap(canvas, faceSize);
          setFaces(sliced);
        } catch {
          // Fallback if slicing fails
        }
      }
      setIsSlicing(false);
    };
    img.src = currentPanoramaUrl;
  }, [currentPanoramaUrl, faceSize]);

  // Download all 6 faces as a ZIP package
  const handleDownloadAllZip = async () => {
    if (faces.length === 0) return;
    const zip = new JSZip();

    for (const face of faces) {
      // Extract base64 part
      const base64Data = face.dataUrl.split(',')[1];
      zip.file(`${face.name}.png`, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cubemap-6faces-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleDownloadFace = (face: CubemapFace) => {
    const a = document.createElement('a');
    a.href = face.dataUrl;
    a.download = `cubemap-${face.name}.png`;
    a.click();
  };

  const getFaceByName = (name: string) => faces.find((f) => f.name === name);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2.5">
          <Box className="w-7 h-7 text-cyan-400" />
          <span>Equirectangular to Cubemap Generator</span>
        </h1>
        <p className="text-sm text-slate-400">
          Transform seamless 2:1 panoramic images into standard 6-sided cubemaps (+X, -X, +Y, -Y, +Z, -Z) for Unity, Unreal Engine, and WebGL game skyboxes.
        </p>
      </div>

      {/* Main Controls & Batch Download Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-300">Face Resolution:</span>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs">
            {[256, 512, 1024].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFaceSize(sz)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  faceSize === sz ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sz} × {sz}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadAllZip}
          disabled={isSlicing || faces.length === 0}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>ZIP Downloaded!</span>
            </>
          ) : isSlicing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Ray-Casting Faces...</span>
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              <span>Download 6 Faces (ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Unfolded Cube Cross (T-Cross) Preview Layout */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Unfolded T-Cross Layout Preview
          </span>
          <span className="text-[11px] text-slate-500">Industry Standard Cubemap Mapping</span>
        </div>

        {/* Cross Grid */}
        <div className="max-w-md mx-auto py-4">
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1: Top (+Y) centered above Front */}
            <div className="col-start-2">
              <FaceThumbnail face={getFaceByName('posy')} onDownload={handleDownloadFace} />
            </div>

            {/* Row 2: Left (-X), Front (+Z), Right (+X), Back (-Z) */}
            <div className="col-start-1 row-start-2">
              <FaceThumbnail face={getFaceByName('negx')} onDownload={handleDownloadFace} />
            </div>
            <div className="col-start-2 row-start-2">
              <FaceThumbnail face={getFaceByName('posz')} onDownload={handleDownloadFace} />
            </div>
            <div className="col-start-3 row-start-2">
              <FaceThumbnail face={getFaceByName('posx')} onDownload={handleDownloadFace} />
            </div>
            <div className="col-start-4 row-start-2">
              <FaceThumbnail face={getFaceByName('negz')} onDownload={handleDownloadFace} />
            </div>

            {/* Row 3: Bottom (-Y) under Front */}
            <div className="col-start-2 row-start-3">
              <FaceThumbnail face={getFaceByName('negy')} onDownload={handleDownloadFace} />
            </div>
          </div>
        </div>
      </div>

      {/* Individual Face Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {faces.map((face) => (
          <div
            key={face.name}
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                <img src={face.dataUrl} alt={face.label} className="w-full h-full object-cover" />
              </div>
              <div className="mt-2">
                <div className="text-xs font-semibold text-white">{face.label}</div>
                <div className="text-[10px] text-slate-500 font-mono">{face.name}.png</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadFace(face)}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>PNG</span>
            </button>
          </div>
        ))}
      </div>

      {/* Game Engine Import Instructions */}
      <div className="border-t border-slate-800/80 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          How to Import Cubemaps into Game Engines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
            <div className="font-semibold text-slate-200">Unity Skybox Import</div>
            <p className="text-[11px] leading-relaxed">
              1. Download the 6 faces ZIP and extract it to your Unity `Assets` folder.<br />
              2. Create a new Material in Unity, set Shader to `Skybox/6 Sided`.<br />
              3. Assign the extracted textures to Front (+Z), Back (-Z), Left (-X), Right (+X), Up (+Y), and Down (-Y).
            </p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1.5">
            <div className="font-semibold text-slate-200">Unreal Engine &amp; Godot</div>
            <p className="text-[11px] leading-relaxed">
              1. In Unreal Engine, import the images and create a `Cube Texture`.<br />
              2. Assign to your Post Process Volume or Sky Light.<br />
              3. In Godot 4, add a `PanoramaSkyMaterial` or assign to `Sky` Resource.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaceThumbnail({
  face,
  onDownload,
}: {
  face?: CubemapFace;
  onDownload: (face: CubemapFace) => void;
}) {
  if (!face) {
    return <div className="aspect-square bg-slate-950/40 border border-slate-800/40 rounded-lg" />;
  }

  return (
    <div
      onClick={() => onDownload(face)}
      className="aspect-square bg-slate-950 border border-slate-700/80 hover:border-cyan-500 rounded-lg overflow-hidden relative group cursor-pointer transition-all shadow-md"
      title={`Click to download ${face.label}`}
    >
      <img src={face.dataUrl} alt={face.label} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
        <span className="text-[10px] font-bold">{face.label}</span>
        <Download className="w-3.5 h-3.5 text-cyan-400" />
      </div>
      <div className="absolute bottom-1 right-1 text-[9px] font-mono px-1 rounded bg-slate-900/80 text-slate-300 pointer-events-none">
        {face.name}
      </div>
    </div>
  );
}
