import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  createSeededRandom,
  createSurveySession,
  findOptionValue,
  loadSbtiRuntime
} from '../src/runtime.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.resolve(__dirname, '../src/cli.mjs');

test('help output only advertises the locked-down CLI options', () => {
  const result = spawnSync(process.execPath, [cliPath, '--help'], {
    encoding: 'utf8'
  });

  assert.equal(result.status, 0);
  assert.doesNotMatch(result.stdout, /preview-dimensions/);
  assert.doesNotMatch(result.stdout, /source-file/);
  assert.doesNotMatch(result.stdout, /source-url/);
});

test('interactive banner does not expose upstream source provenance', () => {
  const result = spawnSync(process.execPath, [cliPath], {
    encoding: 'utf8',
    input: 'q\n'
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /SBTI 人格测试 CLI/);
  assert.doesNotMatch(result.stdout, /题库来源|Question source|https?:\/\/|main\.js/);
});

test('lowercase b stays available as option B and the CLI source contains no backtracking controls', async () => {
  const runtime = await loadSbtiRuntime({
    random: createSeededRandom('1')
  });
  const session = createSurveySession(runtime);
  const firstQuestion = session.getCurrentQuestion();
  const cliSource = await readFile(cliPath, 'utf8');

  assert.equal(findOptionValue(firstQuestion, 'b'), firstQuestion.options[1].value);
  assert.doesNotMatch(cliSource, /\^\(b\|back\)\$/);
  assert.doesNotMatch(cliSource, /已经是第一题了|返回上一题|question number|题号/);
  assert.match(cliSource, /输入 A\/B\/C\/D 选择，或输入 q 退出。/);
});
