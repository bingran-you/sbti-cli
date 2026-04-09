import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { BUNDLED_SBTI_SNAPSHOT } from '../src/bundled-data.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimePath = path.join(repoRoot, 'src/runtime.mjs');
const cliPath = path.join(repoRoot, 'src/cli.mjs');
const distDir = path.join(repoRoot, 'dist');
const distPath = path.join(distDir, 'sbti-cli.mjs');

function stripRuntimeSource(source) {
  return source
    .replace(
      /^import vm from 'node:vm';\n\nimport \{ BUNDLED_SBTI_SNAPSHOT \} from '\.\/bundled-data\.mjs';\n\n/,
      ''
    )
    .replace(/^export\s+/gm, '');
}

function stripCliSource(source) {
  return source
    .replace(/^#!\/usr\/bin\/env node\n\n/, '')
    .replace(
      /^import \{ createInterface \} from 'node:readline\/promises';\nimport process from 'node:process';\n\nimport \{[\s\S]*?\} from '\.\/runtime\.mjs';\n\n/,
      ''
    );
}

const [runtimeSource, cliSource] = await Promise.all([
  readFile(runtimePath, 'utf8'),
  readFile(cliPath, 'utf8')
]);

const compressedSnapshot = gzipSync(
  Buffer.from(JSON.stringify(BUNDLED_SBTI_SNAPSHOT), 'utf8')
).toString('base64');

const distSource = [
  '#!/usr/bin/env node',
  '',
  "import vm from 'node:vm';",
  "import { createInterface } from 'node:readline/promises';",
  "import process from 'node:process';",
  "import { gunzipSync } from 'node:zlib';",
  '',
  'const BUNDLED_SBTI_SNAPSHOT = JSON.parse(',
  `  gunzipSync(Buffer.from('${compressedSnapshot}', 'base64')).toString('utf8')`,
  ');',
  '',
  stripRuntimeSource(runtimeSource).trim(),
  '',
  stripCliSource(cliSource).trim(),
  ''
].join('\n');

await mkdir(distDir, { recursive: true });
await writeFile(distPath, distSource, 'utf8');
await chmod(distPath, 0o755);

console.log(`Built ${distPath}`);
