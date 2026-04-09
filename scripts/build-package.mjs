import { chmod, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const releaseDir = path.join(repoRoot, 'release', 'npm');

const [rootPackageText, readmeText, noticeText] = await Promise.all([
  readFile(path.join(repoRoot, 'package.json'), 'utf8'),
  readFile(path.join(repoRoot, 'npm', 'README.md'), 'utf8'),
  readFile(path.join(repoRoot, 'npm', 'NOTICE'), 'utf8')
]);

const rootPackage = JSON.parse(rootPackageText);
const publishedPackage = {
  name: rootPackage.name,
  version: rootPackage.version,
  description: rootPackage.description,
  license: rootPackage.license,
  type: 'module',
  bin: {
    'sbti-cli': './bin/sbti-cli.cjs'
  },
  engines: rootPackage.engines
};

await rm(releaseDir, { recursive: true, force: true });
await Promise.all([
  mkdir(path.join(releaseDir, 'bin'), { recursive: true }),
  mkdir(path.join(releaseDir, 'dist'), { recursive: true })
]);

const launcherSource = `#!/usr/bin/env node

const { pathToFileURL } = require('node:url');
const path = require('node:path');

const entryUrl = pathToFileURL(path.join(__dirname, '..', 'dist', 'sbti-cli.mjs')).href;
import(entryUrl);
`;

await Promise.all([
  cp(path.join(repoRoot, 'dist', 'sbti-cli.mjs'), path.join(releaseDir, 'dist', 'sbti-cli.mjs')),
  cp(path.join(repoRoot, 'LICENSE'), path.join(releaseDir, 'LICENSE')),
  writeFile(path.join(releaseDir, 'README.md'), readmeText, 'utf8'),
  writeFile(path.join(releaseDir, 'NOTICE'), noticeText, 'utf8'),
  writeFile(path.join(releaseDir, 'package.json'), `${JSON.stringify(publishedPackage, null, 2)}\n`, 'utf8'),
  writeFile(path.join(releaseDir, 'bin', 'sbti-cli.cjs'), launcherSource, 'utf8')
]);

await chmod(path.join(releaseDir, 'bin', 'sbti-cli.cjs'), 0o755);

console.log(`Built npm release package at ${releaseDir}`);
