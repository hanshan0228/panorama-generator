/**
 * Zenith (+90°) and Nadir / Tripod (-90°) Inpainting & Healing.
 * Provides:
 * 1. Tripod/Nadir hole mask fill using seamless radial clone blur.
 * 2. Zenith hole smoothing to eliminate pole pinching black holes.
 * 3. Logo/Watermark nadir disc patch overlay option.
 */

export interface PoleRepairOptions {
  repairNadir?: boolean; // Repair ground/tripod hole
  repairZenith?: boolean; // Repair sky zenith hole
  nadirRadiusRatio?: number; // 0.05 to 0.20 of image height (default 0.12)
  zenithRadiusRatio?: number; // 0.03 to 0.15 of image height (default 0.08)
  addLogoDisc?: boolean;
  discLabel?: string;
}

export function repairPanoramaPoles(
  sourceCanvas: HTMLCanvasElement,
  options: PoleRepairOptions = {}
): HTMLCanvasElement {
  const {
    repairNadir = true,
    repairZenith = true,
    nadirRadiusRatio = 0.12,
    zenithRadiusRatio = 0.08,
    addLogoDisc = false,
    discLabel = '360° VR PANORAMA',
  } = options;

  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = w;
  outputCanvas.height = h;

  const ctx = outputCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return sourceCanvas;

  // 1. Copy source
  ctx.drawImage(sourceCanvas, 0, 0);

  // 2. Repair Nadir (Bottom pole / Tripod hole)
  if (repairNadir) {
    const nadirHeight = Math.round(h * nadirRadiusRatio);
    const sampleY = h - nadirHeight - 4; // Sample ring just above the tripod zone

    // Sample an ambient color strip from the surrounding ground
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = w;
    sampleCanvas.height = 4;
    const sCtx = sampleCanvas.getContext('2d');
    if (sCtx) {
      sCtx.drawImage(sourceCanvas, 0, sampleY, w, 4, 0, 0, w, 4);

      // Smooth stretch downward with blur to cover the tripod
      ctx.save();
      ctx.filter = 'blur(16px)';
      ctx.drawImage(sampleCanvas, 0, 0, w, 4, 0, h - nadirHeight, w, nadirHeight);
      ctx.restore();

      // Soft vertical alpha blend between original and healed nadir
      const grad = ctx.createLinearGradient(0, h - nadirHeight - 8, 0, h);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.3, 'rgba(0,0,0,0.1)');
      grad.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, h - nadirHeight, w, nadirHeight);
    }

    // Optional modern circular Nadir cap disc (industry standard like Insta360 / Matterport)
    if (addLogoDisc) {
      const discH = Math.round(nadirHeight * 0.7);
      const discGrad = ctx.createLinearGradient(0, h - discH, 0, h);
      discGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
      discGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
      ctx.fillStyle = discGrad;
      ctx.fillRect(0, h - discH, w, discH);

      // Subtle accent glow line
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h - discH);
      ctx.lineTo(w, h - discH);
      ctx.stroke();

      // Repeated subtle label
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'center';
      const step = w / 4;
      for (let x = step / 2; x < w; x += step) {
        ctx.fillText(discLabel, x, h - discH / 2 + 5);
      }
    }
  }

  // 3. Repair Zenith (Top pole / Sun blowout / Black pinhole)
  if (repairZenith) {
    const zenithHeight = Math.round(h * zenithRadiusRatio);
    const sampleY = zenithHeight + 2;

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = w;
    sampleCanvas.height = 4;
    const sCtx = sampleCanvas.getContext('2d');
    if (sCtx) {
      sCtx.drawImage(sourceCanvas, 0, sampleY, w, 4, 0, 0, w, 4);

      ctx.save();
      ctx.filter = 'blur(12px)';
      ctx.drawImage(sampleCanvas, 0, 0, w, 4, 0, 0, w, zenithHeight);
      ctx.restore();
    }
  }

  return outputCanvas;
}
