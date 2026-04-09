import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_SBTI_SOURCE_URL,
  fetchSbtiSource,
  loadSbtiRuntime
} from '../src/runtime.mjs';
import {
  buildTypeImageGalleryHtml,
  extractTypeImagesFromSource,
  parseTypeImageDataUrl
} from '../src/type-images.mjs';

function parseArgs(argv) {
  const options = {
    sourceFile: null,
    sourceUrl: DEFAULT_SBTI_SOURCE_URL,
    outDir: 'assets/type-images'
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--source-file') {
      options.sourceFile = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === '--source-url') {
      options.sourceUrl = argv[index + 1] ?? DEFAULT_SBTI_SOURCE_URL;
      index += 1;
      continue;
    }

    if (arg === '--out-dir') {
      options.outDir = argv[index + 1] ?? options.outDir;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = parseArgs(process.argv.slice(2));
const outputDir = path.resolve(__dirname, '..', options.outDir);
const sourceIdentifier = options.sourceFile ?? options.sourceUrl;
const sourceText = options.sourceFile
  ? await readFile(options.sourceFile, 'utf8')
  : await fetchSbtiSource(options.sourceUrl);

const runtime = await loadSbtiRuntime({
  sourceText,
  sourceUrl: sourceIdentifier
});
const typeImages = extractTypeImagesFromSource(sourceText);
const typeCodes = Object.keys(runtime.exports.TYPE_LIBRARY);

await mkdir(outputDir, { recursive: true });

const manifest = [];

for (const code of typeCodes) {
  const dataUrl = typeImages[code];
  if (!dataUrl) {
    throw new Error(`Missing image for type ${code}`);
  }

  const image = parseTypeImageDataUrl(dataUrl);
  const fileName = `${code}.${image.extension}`;
  const outputPath = path.join(outputDir, fileName);

  await writeFile(outputPath, image.buffer);

  manifest.push({
    code,
    cn: runtime.exports.TYPE_LIBRARY[code].cn,
    intro: runtime.exports.TYPE_LIBRARY[code].intro,
    mimeType: image.mimeType,
    fileName,
    bytes: image.buffer.length
  });
}

await writeFile(
  path.join(outputDir, 'manifest.json'),
  JSON.stringify({
    extractedFrom: sourceIdentifier,
    extractedAt: new Date().toISOString(),
    count: manifest.length,
    entries: manifest
  }, null, 2),
  'utf8'
);

await writeFile(
  path.join(outputDir, 'index.html'),
  buildTypeImageGalleryHtml(manifest),
  'utf8'
);

console.log(`Exported ${manifest.length} type images to ${outputDir}`);
