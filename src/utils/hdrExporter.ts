/**
 * Radiance RGBE (.hdr) exporter.
 * Encodes standard 8-bit RGB canvas into Radiance RGBE container format
 * supported by Blender, Unreal Engine, Unity, and Maya.
 */
export function exportCanvasToHdrBlob(canvas: HTMLCanvasElement): Blob {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  // Header string
  const header =
    '#?RADIANCE\n' +
    'FORMAT=32-bit_rle_rgbe\n' +
    'EXPOSURE=1.0\n\n' +
    `-Y ${height} +X ${width}\n`;

  const headerBytes = new TextEncoder().encode(header);
  const pixelBytes = new Uint8Array(width * height * 4);

  let pIdx = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] / 255.0;
    const g = pixels[i + 1] / 255.0;
    const b = pixels[i + 2] / 255.0;

    const maxVal = Math.max(r, g, b);
    if (maxVal < 1e-32) {
      pixelBytes[pIdx] = 0;
      pixelBytes[pIdx + 1] = 0;
      pixelBytes[pIdx + 2] = 0;
      pixelBytes[pIdx + 3] = 0;
    } else {
      // Find exponent in base 2 with bias 128
      const exponent = Math.ceil(Math.log2(maxVal) + 128);
      const scale = Math.pow(2, exponent - 128);

      pixelBytes[pIdx] = Math.min(255, Math.round((r / scale) * 256.0));
      pixelBytes[pIdx + 1] = Math.min(255, Math.round((g / scale) * 256.0));
      pixelBytes[pIdx + 2] = Math.min(255, Math.round((b / scale) * 256.0));
      pixelBytes[pIdx + 3] = Math.min(255, exponent);
    }
    pIdx += 4;
  }

  // Combine header and raw RGBE bytes
  const totalLength = headerBytes.length + pixelBytes.length;
  const combined = new Uint8Array(totalLength);
  combined.set(headerBytes, 0);
  combined.set(pixelBytes, headerBytes.length);

  return new Blob([combined], { type: 'image/vnd.radiance' });
}
