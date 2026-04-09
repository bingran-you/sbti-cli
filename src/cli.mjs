#!/usr/bin/env node

import { createInterface } from 'node:readline/promises';
import process from 'node:process';

import {
  createSeededRandom,
  createSurveySession,
  findOptionValue,
  formatOptionCode,
  getQuestionMetaLabel,
  loadSbtiRuntime
} from './runtime.mjs';

function parseArgs(argv) {
  const options = {
    help: false,
    json: false,
    seed: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--seed') {
      options.seed = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`SBTI survey CLI

Usage:
  npm run sbti
  npm run sbti -- --seed 42

Options:
  --seed <number>              Use deterministic question ordering for testing.
  --json                       Print the final result as JSON.
  --help, -h                   Show this help message.
`);
}

function printQuestion(question, index, total) {
  const metaLabel = getQuestionMetaLabel(question);

  console.log(`\n第 ${index + 1} 题 / ${total} · ${metaLabel}`);
  console.log(question.text);
  console.log('');

  question.options.forEach((option, optionIndex) => {
    console.log(`  ${formatOptionCode(optionIndex)}. ${option.label}`);
  });

  console.log('\n输入 A/B/C/D 选择，或输入 q 退出。');
}

function printResult(result, runtime) {
  const type = result.finalType;

  console.log('\n=== 测试结果 ===');
  console.log(result.modeKicker);
  console.log(`${type.code}（${type.cn}）`);
  console.log(result.badge);
  console.log(result.sub);
  console.log(`结果字符串: ${result.resultPattern}`);
  console.log('');
  console.log(type.intro);
  console.log(type.desc);

  if (result.secondaryType) {
    console.log('');
    console.log(`常规主类型: ${result.secondaryType.code}（${result.secondaryType.cn}）`);
  }

  console.log('');
  console.log(
    `普通人格第一名: ${result.bestNormal.code}（${result.bestNormal.cn}） · 相似度 ${result.bestNormal.similarity}% · 精准命中 ${result.bestNormal.exact}/15 · 总差值 ${result.bestNormal.distance}`
  );

  console.log('\n常规人格 Top 5');
  result.ranked.slice(0, 5).forEach((match, index) => {
    console.log(
      `${index + 1}. ${match.code}（${match.cn}） · 相似度 ${match.similarity}% · 精准命中 ${match.exact}/15 · 总差值 ${match.distance}`
    );
  });

  console.log('\n十五维度评分');
  runtime.exports.dimensionOrder.forEach((dimensionId) => {
    const meta = runtime.exports.dimensionMeta[dimensionId];
    const level = result.levels[dimensionId];
    const rawScore = result.rawScores[dimensionId];
    const explanation = runtime.exports.DIM_EXPLANATIONS[dimensionId][level];
    console.log(`- ${meta.name}: ${level} / ${rawScore}分`);
    console.log(`  ${explanation}`);
  });
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const random = options.seed === null ? Math.random : createSeededRandom(options.seed);
  const runtime = await loadSbtiRuntime({
    random
  });
  const session = createSurveySession(runtime);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('SBTI 人格测试 CLI');
  console.log(`题库来源: ${runtime.sourceDescription}`);
  if (options.seed !== null) {
    console.log(`随机种子: ${options.seed}`);
  }

  try {
    while (!session.getProgress().complete) {
      const progress = session.getProgress();
      const question = session.getCurrentQuestion();
      printQuestion(question, progress.done, progress.total);
      const response = await rl.question('> ');
      const normalized = response.trim();

      if (!normalized) {
        console.log('请输入一个选项。');
        continue;
      }

      if (/^(q|quit|exit)$/i.test(normalized)) {
        console.log('已退出，未提交结果。');
        return;
      }

      const value = findOptionValue(question, normalized);
      if (value === null) {
        console.log('请输入有效选项，比如 A、B、C、D 或对应数字。');
        continue;
      }

      session.answerQuestion(question.id, value);
    }
  } finally {
    rl.close();
  }

  const result = session.computeResult();

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printResult(result, runtime);
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
