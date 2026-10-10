/**
 * Encodes 8-bit RGB canvas pixels into a Radiance RGBE container.
 * This changes the file format, not the source image's dynamic range.
 */
const MIN_RLE_WIDTH = 8;
const MAX_RLE_WIDTH = 0x7fff;
const MAX_LITERAL_LENGTH = 128;
const MAX_RUN_LENGTH = 127;

function encodeChannelRle(channel: Uint8Array, out: Uint8Array, offset: number): number {
  let i = 0;
  while (i < channel.length) {
    let runLength = 1;
    while (i + runLength < channel.length && channel[i + runLength] === channel[i] && runLength < MAX_RUN_LENGTH) {
      runLength++;
    }
    if (runLength >= 3) {
      out[offset++] = 128 + runLength;
      out[offset++] = channel[i];
      i += runLength;
    } else {
      let literalLength = 1;
      while (
        i + literalLength < channel.length && literalLength < MAX_LITERAL_LENGTH &&
        !(i + literalLength + 2 < channel.length &&
          channel[i + literalLength] === channel[i + literalLength + 1] &&
          channel[i + literalLength] === channel[i + literalLength + 2])
      ) {
        literalLength++;
      }
      out[offset++] = literalLength;
      out.set(channel.subarray(i, i + literalLength), offset);
      offset += literalLength;
      i += literalLength;
    }
  }
  return offset;
}

function fillRgbeRow(pixels: Uint8ClampedArray, start: number, channels: Uint8Array[]): void {
  const [red, green, blue, exponent] = channels;
  for (let x = 0; x < red.length; x++) {
    const index = start + x * 4;
    const r = pixels[index] / 255;
    const g = pixels[index + 1] / 255;
    const b = pixels[index + 2] / 255;
    const maxValue = Math.max(r, g, b);
    if (maxValue < 1e-32) {
      red[x] = green[x] = blue[x] = exponent[x] = 0;
    } else {
      const e = Math.ceil(Math.log2(maxValue) + 128);
      const scale = Math.pow(2, e - 128);
      red[x] = Math.min(255, Math.round((r / scale) * 256));
      green[x] = Math.min(255, Math.round((g / scale) * 256));
      blue[x] = Math.min(255, Math.round((b / scale) * 256));
      exponent[x] = e;
    }
  }
}

function encodeRow(channels: Uint8Array[], width: number): Uint8Array<ArrayBuffer> {
  if (width < MIN_RLE_WIDTH || width > MAX_RLE_WIDTH) {
    const row = new Uint8Array(width * 4);
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 4; c++) row[x * 4 + c] = channels[c][x];
    }
    return row;
  }
  // Worst case: literal data plus one count byte per 128 values, per channel.
  const row = new Uint8Array(4 + 4 * (width + Math.ceil(width / MAX_LITERAL_LENGTH)));
  row.set([2, 2, (width >> 8) & 0xff, width & 0xff]);
  let offset = 4;
  for (const channel of channels) offset = encodeChannelRle(channel, row, offset);
  return row.subarray(0, offset);
}

export function exportCanvasToHdrBlob(canvas: HTMLCanvasElement): Blob {
  const { width, height } = canvas;
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
    throw new Error('Canvas dimensions must be positive integers');
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const header = '#?RADIANCE\nFORMAT=32-bit_rle_rgbe\nEXPOSURE=1.0\n\n' + `-Y ${height} +X ${width}\n`;
  const parts: BlobPart[] = [new TextEncoder().encode(header)];
  const channels = Array.from({ length: 4 }, () => new Uint8Array(width));
  for (let y = 0; y < height; y++) {
    fillRgbeRow(pixels, y * width * 4, channels);
    parts.push(encodeRow(channels, width));
  }
  // Keep byte buffers per scanline; never expand the entire file into number[].
  return new Blob(parts, { type: 'image/vnd.radiance' });
}
