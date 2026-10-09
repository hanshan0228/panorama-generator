import type { CubemapFace, CubemapFaceName } from '../types/panorama';

const FACES: Array<{ name: CubemapFaceName; label: string }> = [
  { name: 'posx', label: 'Right (+X)' },
  { name: 'negx', label: 'Left (-X)' },
  { name: 'posy', label: 'Top (+Y)' },
  { name: 'negy', label: 'Bottom (-Y)' },
  { name: 'posz', label: 'Front (+Z)' },
  { name: 'negz', label: 'Back (-Z)' },
];

/**
 * Converts a 2:1 equirectangular image into 6 cubemap faces using 3D ray-casting.
 */
export function sliceEquirectangularToCubemap(
  sourceCanvas: HTMLCanvasElement,
  faceSize = 512
): CubemapFace[] {
  const eqWidth = sourceCanvas.width;
  const eqHeight = sourceCanvas.height;

  const srcCtx = sourceCanvas.getContext('2d');
  if (!srcCtx) {
    throw new Error('Failed to acquire 2D context from source canvas');
  }

  const srcData = srcCtx.getImageData(0, 0, eqWidth, eqHeight);
  const srcPixels = srcData.data;

  const cubemapFaces: CubemapFace[] = [];

  for (const face of FACES) {
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = faceSize;
    faceCanvas.height = faceSize;
    const faceCtx = faceCanvas.getContext('2d');
    if (!faceCtx) continue;

    const faceImgData = faceCtx.createImageData(faceSize, faceSize);
    const facePixels = faceImgData.data;

    for (let j = 0; j < faceSize; j++) {
      // Normalized v in [-1, 1]
      const v = 1 - (2 * (j + 0.5)) / faceSize;

      for (let i = 0; i < faceSize; i++) {
        // Normalized u in [-1, 1]
        const u = (2 * (i + 0.5)) / faceSize - 1;

        let rx = 0;
        let ry = 0;
        let rz = 0;

        switch (face.name) {
          case 'posx': // Right
            rx = 1;
            ry = v;
            rz = -u;
            break;
          case 'negx': // Left
            rx = -1;
            ry = v;
            rz = u;
            break;
          case 'posy': // Top
            rx = u;
            ry = 1;
            rz = -v;
            break;
          case 'negy': // Bottom
            rx = u;
            ry = -1;
            rz = v;
            break;
          case 'posz': // Front
            rx = u;
            ry = v;
            rz = 1;
            break;
          case 'negz': // Back
            rx = -u;
            ry = v;
            rz = -1;
            break;
        }

        const rLen = Math.hypot(rx, ry, rz);
        const nx = rx / rLen;
        const ny = ry / rLen;
        const nz = rz / rLen;

        // Longitude in [-PI, PI], Latitude in [-PI/2, PI/2]
        const lon = Math.atan2(nx, nz);
        const lat = Math.asin(Math.max(-1, Math.min(1, ny)));

        // Map to Equirectangular coordinates (0 to eqWidth - 1, 0 to eqHeight - 1)
        const eqX = ((lon / Math.PI + 1) * 0.5) * (eqWidth - 1);
        const eqY = (0.5 - lat / Math.PI) * (eqHeight - 1);

        // Nearest-neighbor sample
        const srcX = Math.min(eqWidth - 1, Math.max(0, Math.round(eqX)));
        const srcY = Math.min(eqHeight - 1, Math.max(0, Math.round(eqY)));

        const srcIdx = (srcY * eqWidth + srcX) * 4;
        const faceIdx = (j * faceSize + i) * 4;

        facePixels[faceIdx] = srcPixels[srcIdx];
        facePixels[faceIdx + 1] = srcPixels[srcIdx + 1];
        facePixels[faceIdx + 2] = srcPixels[srcIdx + 2];
        facePixels[faceIdx + 3] = 255;
      }
    }

    faceCtx.putImageData(faceImgData, 0, 0);

    cubemapFaces.push({
      name: face.name,
      label: face.label,
      dataUrl: faceCanvas.toDataURL('image/png'),
      canvas: faceCanvas,
    });
  }

  return cubemapFaces;
}
