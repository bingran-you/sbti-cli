import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const releaseDir = path.join(repoRoot, 'release', 'npm');

test('npm release package only publishes sanitized standalone CLI metadata', async () => {
  const buildResult = spawnSync('npm', ['run', 'build:package'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  });

  assert.equal(buildResult.status, 0, buildResult.stderr);

  const result = spawnSync('npm', ['pack', '--dry-run', '--json', releaseDir], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  });

  assert.equal(result.status, 0, result.stderr);

  const jsonStart = result.stdout.indexOf('[');
  assert.notEqual(jsonStart, -1, 'expected npm pack JSON output');

  const packResult = JSON.parse(result.stdout.slice(jsonStart))[0];
  const publishedPaths = packResult.files.map((entry) => entry.path).sort();

  assert.ok(publishedPaths.includes('bin/sbti-cli.cjs'));
  assert.ok(publishedPaths.includes('dist/sbti-cli.mjs'));
  assert.deepEqual(
    publishedPaths.filter((entry) => /^(assets|scripts|src|test)\//.test(entry)),
    []
  );

  const [publishedReadme, publishedNotice, launcherSource, distSource] = await Promise.all([
    readFile(path.join(releaseDir, 'README.md'), 'utf8'),
    readFile(path.join(releaseDir, 'NOTICE'), 'utf8'),
    readFile(path.join(releaseDir, 'bin', 'sbti-cli.cjs'), 'utf8'),
    readFile(path.join(releaseDir, 'dist', 'sbti-cli.mjs'), 'utf8')
  ]);
  const publishedPackage = JSON.parse(
    await readFile(path.join(releaseDir, 'package.json'), 'utf8')
  );

  assert.equal(publishedPackage.name, '@bingran/sbti-cli');
  assert.deepEqual(publishedPackage.bin, {
    'sbti-cli': './bin/sbti-cli.cjs'
  });
  assert.doesNotMatch(publishedReadme, /https?:\/\/|main\.js|\bwebsite\b/i);
  assert.doesNotMatch(publishedNotice, /https?:\/\/|main\.js|\bwebsite\b/i);
  assert.doesNotMatch(launcherSource, /https?:\/\/|main\.js|\bwebsite\b/i);
  assert.doesNotMatch(distSource, /https?:\/\/|main\.js|\bwebsite\b/i);
});
