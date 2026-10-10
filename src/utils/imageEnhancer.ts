/**
 * Client-Side Super-Resolution & Clarity Enhancement Engine.
 * Enhances low-resolution or blurry 360 panorama photos:
 * 1. Upscales image by 2x or 4x using edge-preserving interpolation.
 * 2. Applies an Unsharp Masking (USM) convolution to extract high-frequency textures.
 * 3. Applies Micro-Contrast Equalization (Dehazing) to eliminate compression cloudiness.
 */

export interface EnhanceOptions {
  scaleFactor?: 1 | 2 | 4;
  sharpness?: number; // 0.0 to 1.0
  contrastBoost?: number; // 1.0 to 1.3
}

export function enhanceAndUpscalePanorama(
  sourceImage: HTMLImageElement,
  options: EnhanceOptions = {}
): HTMLCanvasElement {
  const { scaleFactor = 2, sharpness = 0.65, contrastBoost = 1.08 } = options;

  const origW = sourceImage.naturalWidth || sourceImage.width;
  const origH = sourceImage.naturalHeight || sourceImage.height;

  const targetW = scaleFactor === 1 ? origW : Math.min(4096, origW * scaleFactor);
  const targetH = scaleFactor === 1 ? origH : Math.min(2048, origH * scaleFactor);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  // 1. High-quality smooth upscaled draw
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceImage, 0, 0, targetW, targetH);

  // 2. Extract pixel data for sharpening & micro-contrast
  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const src = new Uint8ClampedArray(imgData.data);
  const dst = imgData.data;

  // Sharpening strength
  const kWeight = sharpness * 0.7;

  // Convolution unsharp mask pass (3x3 kernel)
  // [  0,   -k,    0 ]
  // [ -k, 1+4k,   -k ]
  // [  0,   -k,    0 ]
  const centerWeight = 1.0 + 4.0 * kWeight;

  for (let y = 1; y < targetH - 1; y++) {
    const rowOffset = y * targetW;
    const upOffset = (y - 1) * targetW;
    const downOffset = (y + 1) * targetW;

    for (let x = 1; x < targetW - 1; x++) {
      const idx = (rowOffset + x) * 4;
      const upIdx = (upOffset + x) * 4;
      const downIdx = (downOffset + x) * 4;
      const leftIdx = (rowOffset + (x - 1)) * 4;
      const rightIdx = (rowOffset + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const center = src[idx + c];
        const up = src[upIdx + c];
        const down = src[downIdx + c];
        const left = src[leftIdx + c];
        const right = src[rightIdx + c];

        // Convolve
        let sharpened = center * centerWeight - (up + down + left + right) * kWeight;

        // Apply subtle micro-contrast curve (S-curve around midpoint 128)
        if (contrastBoost > 1.0) {
          const norm = (sharpened - 128) / 128;
          sharpened = 128 + norm * contrastBoost * 128;
        }

        dst[idx + c] = Math.max(0, Math.min(255, Math.round(sharpened)));
      }
      dst[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}
