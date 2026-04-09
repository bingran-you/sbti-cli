import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_SBTI_SOURCE_URL,
  fetchSbtiSource,
  loadSbtiRuntime
} from '../src/runtime.mjs';
import {
  extractTypeImagesFromSource,
  getImageExtensionForMimeType,
  parseTypeImageDataUrl
} from '../src/type-images.mjs';

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

test('live survey source exposes one embedded result image per personality type', async (t) => {
  let sourceText;

  try {
    sourceText = await fetchSbtiSource(DEFAULT_SBTI_SOURCE_URL);
  } catch (error) {
    t.skip(`Unable to reach ${DEFAULT_SBTI_SOURCE_URL}: ${error.message}`);
    return;
  }

  const runtime = await loadSbtiRuntime({
    sourceText,
    sourceUrl: DEFAULT_SBTI_SOURCE_URL
  });
  const typeImages = extractTypeImagesFromSource(sourceText);
  const typeCodes = Object.keys(runtime.exports.TYPE_LIBRARY);

  assert.equal(typeCodes.length, 27);
  assert.equal(Object.keys(typeImages).length, typeCodes.length);
  assert.deepEqual(
    Object.keys(typeImages).sort(),
    typeCodes.slice().sort()
  );

  for (const code of typeCodes) {
    assert.match(typeImages[code], /^data:image\/(png|jpeg);base64,/);
  }
});
