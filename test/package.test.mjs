import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

test('npm pack only publishes the standalone dist CLI and package metadata', () => {
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  });

  assert.equal(result.status, 0, result.stderr);

  const jsonStart = result.stdout.indexOf('[');
  assert.notEqual(jsonStart, -1, 'expected npm pack JSON output');

  const packResult = JSON.parse(result.stdout.slice(jsonStart))[0];
  const publishedPaths = packResult.files.map((entry) => entry.path).sort();

  assert.ok(publishedPaths.includes('dist/sbti-cli.mjs'));
  assert.deepEqual(
    publishedPaths.filter((entry) => /^(assets|scripts|src|test)\//.test(entry)),
    []
  );
});
