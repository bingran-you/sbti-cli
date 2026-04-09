import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { loadSbtiRuntime } from '../src/runtime.mjs';
import {
  buildTypeImageGalleryHtml,
  getMimeTypeForImageExtension
} from '../src/type-images.mjs';

function parseArgs(argv) {
  const options = {
    outDir: 'assets/type-images'
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

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
const runtime = await loadSbtiRuntime();
const typeCodes = Object.keys(runtime.exports.TYPE_LIBRARY);

await mkdir(outputDir, { recursive: true });
const directoryEntries = await readdir(outputDir);
const assetMap = new Map();

directoryEntries.forEach((entry) => {
  const parsed = path.parse(entry);
  const extension = parsed.ext.replace(/^\./, '').toLowerCase();

  if (!extension || !parsed.name) {
    return;
  }

  assetMap.set(parsed.name, {
    extension,
    fileName: entry
  });
});

const manifest = [];

for (const code of typeCodes) {
  const asset = assetMap.get(code);
  if (!asset) {
    throw new Error(`Missing image for type ${code}`);
  }

  const outputPath = path.join(outputDir, asset.fileName);
  const fileStat = await stat(outputPath);
  const mimeType = getMimeTypeForImageExtension(asset.extension);

  manifest.push({
    code,
    cn: runtime.exports.TYPE_LIBRARY[code].cn,
    intro: runtime.exports.TYPE_LIBRARY[code].intro,
    mimeType,
    fileName: asset.fileName,
    bytes: fileStat.size
  });
}

await writeFile(
  path.join(outputDir, 'manifest.json'),
  JSON.stringify({
    extractedFrom: runtime.sourceUrl,
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

console.log(`Rebuilt metadata for ${manifest.length} local type images in ${outputDir}`);
