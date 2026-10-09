/**
 * Seam and Boundary Correction for 360 Equirectangular Panoramas.
 * Benchmarked against panoramagenerator.com's seam healing logic:
 * Performs horizontal boundary mirror cross-fading to eliminate the 360 degree seam line.
 */
export function healPanoramaSeam(
  sourceCanvas: HTMLCanvasElement,
  blendWidth = 80
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;

  const ctx = resultCanvas.getContext('2d');
  if (!ctx) {
    return sourceCanvas;
  }

  // Draw original image
  ctx.drawImage(sourceCanvas, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Make blendWidth proportional if image is small
  const safeBlend = Math.min(blendWidth, Math.floor(width / 8));

  // Blend the leftmost safeBlend columns and rightmost safeBlend columns
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < safeBlend; x++) {
      const leftIdx = (y * width + x) * 4;
      const rightIdx = (y * width + (width - 1 - (safeBlend - 1 - x))) * 4;

      // Weight from 0 to 1 across the blend boundary
      const alpha = x / safeBlend;

      // Cross-fade RGB channels
      for (let c = 0; c < 3; c++) {
        const leftVal = data[leftIdx + c];
        const rightVal = data[rightIdx + c];

        // Linear interpolation across wrap boundary
        const blended = Math.round(leftVal * alpha + rightVal * (1 - alpha));
        data[leftIdx + c] = blended;
        data[rightIdx + c] = blended;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return resultCanvas;
}
