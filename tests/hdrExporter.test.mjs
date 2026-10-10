import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FloatType } from 'three';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { exportCanvasToHdrBlob } from '../src/utils/hdrExporter.ts';

function makeCanvas(width, height, random = false) {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    const index = i / 4;
    pixels.set(random ? [(index * 73) % 256, (index * 37) % 256, (index * 19) % 256, 255] : [255, 128, 64, 255], i);
  }
  return { width, height, getContext: () => ({ getImageData: () => ({ data: pixels }) }) };
}

for (const width of [1, 4, 8, 127, 128, 129, 2048, 32767, 32768]) {
  for (const random of [false, true]) {
    test(`HDR round trip width=${width}, random=${random}`, async () => {
      const canvas = makeCanvas(width, 2, random);
      const blob = exportCanvasToHdrBlob(canvas);
      const decoded = new HDRLoader().setDataType(FloatType).parse(await blob.arrayBuffer());
      assert.equal(decoded.width, width);
      assert.equal(decoded.height, 2);
      assert.equal(decoded.data.length, width * 2 * 4);
      const expected = canvas.getContext().getImageData().data;
      for (let i = 0; i < expected.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          assert.ok(Math.abs(decoded.data[i + c] - expected[i + c] / 255) < 0.008, `pixel=${i / 4}, channel=${c}`);
        }
        assert.equal(decoded.data[i + 3], 1);
      }
    });
  }
}

test('missing canvas context throws', () => {
  assert.throws(() => exportCanvasToHdrBlob({ width: 8, height: 1, getContext: () => null }), /context/i);
});

for (const [width, height] of [[0, 1], [1, 0], [-1, 1], [1, -1], [1.5, 1], [1, 1.5], [NaN, 1], [1, Infinity]]) {
  test(`invalid dimensions ${width} x ${height} are rejected`, () => {
    assert.throws(() => exportCanvasToHdrBlob({ width, height }), /dimension|size/i);
  });
}

test('black pixel round trip', async () => {
  const canvas = { width: 8, height: 1, getContext: () => ({ getImageData: () => ({ data: new Uint8ClampedArray(32) }) }) };
  const decoded = new HDRLoader().setDataType(FloatType).parse(await exportCanvasToHdrBlob(canvas).arrayBuffer());
  assert.deepEqual(Array.from(decoded.data.slice(0, 4)), [0, 0, 0, 1]);
});
