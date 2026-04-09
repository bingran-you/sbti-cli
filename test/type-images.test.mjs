import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { loadSbtiRuntime } from '../src/runtime.mjs';
import {
  getImageExtensionForMimeType,
  getMimeTypeForImageExtension,
  parseTypeImageDataUrl
} from '../src/type-images.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const typeImagesDir = path.resolve(__dirname, '../assets/type-images');

test('parseTypeImageDataUrl decodes supported image data URLs', () => {
  const parsed = parseTypeImageDataUrl('data:image/png;base64,AA==');

  assert.equal(parsed.mimeType, 'image/png');
  assert.equal(parsed.extension, 'png');
  assert.equal(parsed.buffer.length, 1);
});

test('getImageExtensionForMimeType normalizes supported image types', () => {
  assert.equal(getImageExtensionForMimeType('image/png'), 'png');
  assert.equal(getImageExtensionForMimeType('image/jpeg'), 'jpg');
  assert.equal(getImageExtensionForMimeType('image/jpg'), 'jpg');
});

test('getMimeTypeForImageExtension normalizes supported image extensions', () => {
  assert.equal(getMimeTypeForImageExtension('png'), 'image/png');
  assert.equal(getMimeTypeForImageExtension('jpg'), 'image/jpeg');
  assert.equal(getMimeTypeForImageExtension('jpeg'), 'image/jpeg');
});

test('bundled offline assets expose one local result image per personality type', async () => {
  const runtime = await loadSbtiRuntime();
  const manifest = JSON.parse(
    await readFile(path.join(typeImagesDir, 'manifest.json'), 'utf8')
  );
  const directoryEntries = await readdir(typeImagesDir);
  const typeCodes = Object.keys(runtime.exports.TYPE_LIBRARY);
  const localAssets = directoryEntries.filter((entry) => {
    const extension = path.extname(entry).replace(/^\./, '').toLowerCase();
    return ['png', 'jpg', 'jpeg', 'webp'].includes(extension);
  });

  assert.equal(typeCodes.length, 27);
  assert.equal(localAssets.length, typeCodes.length);
  assert.equal(manifest.count, typeCodes.length);
  assert.deepEqual(
    manifest.entries.map((entry) => entry.code).sort(),
    typeCodes.slice().sort()
  );

  for (const code of typeCodes) {
    assert.ok(
      localAssets.some((entry) => path.parse(entry).name === code),
      `missing local image for ${code}`
    );
  }
});
