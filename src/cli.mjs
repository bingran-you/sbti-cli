#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';

import {
  DEFAULT_SBTI_SOURCE_URL,
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
    previewDimensions: false,
    seed: null,
    sourceFile: null,
    sourceUrl: DEFAULT_SBTI_SOURCE_URL
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

    if (arg === '--preview-dimensions') {
      options.previewDimensions = true;
      continue;
    }

    if (arg === '--seed') {
      options.seed = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

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

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`SBTI survey CLI

Usage:
  npm run sbti
  npm run sbti -- --seed 42
  npm run sbti -- --source-file ./main.js

Options:
  --seed <number>              Use deterministic question ordering for testing.
  --source-url <url>           Fetch survey logic from a custom URL.
  --source-file <path>         Load survey logic from a local main.js file.
  --preview-dimensions         Show dimension labels while answering.
  --json                       Print the final result as JSON.
  --help, -h                   Show this help message.
`);
}

function formatCurrentAnswer(question, value) {
  const optionIndex = question.options.findIndex((option) => option.value === value);
  if (optionIndex === -1) {
    return null;
  }

  return `${formatOptionCode(optionIndex)}. ${question.options[optionIndex].label}`;
}

function printQuestion(question, index, total, existingAnswer, options, runtime) {
  const metaLabel = getQuestionMetaLabel(question, {
    preview: options.previewDimensions,
    dimensionMeta: runtime.exports.dimensionMeta
  });

  console.log(`\n第 ${index + 1} 题 / ${total} · ${metaLabel}`);
  console.log(question.text);
  console.log('');

  question.options.forEach((option, optionIndex) => {
    console.log(`  ${formatOptionCode(optionIndex)}. ${option.label}`);
  });

  if (existingAnswer !== undefined) {
    const currentAnswer = formatCurrentAnswer(question, existingAnswer);
    if (currentAnswer) {
      console.log(`\n当前答案: ${currentAnswer}`);
      console.log('直接回车保留当前答案，输入 b 返回上一题。');
      return;
    }
  }

  console.log('\n输入 A/B/C/D 选择，或输入 b 返回上一题。');
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

async function loadSourceText(options) {
  if (!options.sourceFile) {
    return null;
  }

  return readFile(options.sourceFile, 'utf8');
}

async function run() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const random = options.seed === null ? Math.random : createSeededRandom(options.seed);
  const sourceText = await loadSourceText(options);
  const runtime = await loadSbtiRuntime({
    random,
    sourceText,
    sourceUrl: options.sourceUrl
  });
  const session = createSurveySession(runtime, {
    preview: options.previewDimensions
  });

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('SBTI 人格测试 CLI');
  console.log(`题库来源: ${options.sourceFile ? options.sourceFile : options.sourceUrl}`);
  if (options.seed !== null) {
    console.log(`随机种子: ${options.seed}`);
  }

  let index = 0;

  try {
    while (true) {
      const visibleQuestions = session.getVisibleQuestions();
      const answers = session.getAnswers();
      const progress = session.getProgress();

      if (index >= visibleQuestions.length) {
        const completionAnswer = await rl.question(
          `\n已完成 ${progress.done} / ${progress.total}。直接回车提交，输入题号返回修改，或输入 q 退出: `
        );
        const normalized = completionAnswer.trim();

        if (!normalized) {
          break;
        }

        if (/^(q|quit|exit)$/i.test(normalized)) {
          console.log('已退出，未提交结果。');
          return;
        }

        const targetIndex = Number(normalized);
        if (Number.isInteger(targetIndex) && targetIndex >= 1 && targetIndex <= visibleQuestions.length) {
          index = targetIndex - 1;
          continue;
        }

        console.log('请输入有效题号，或直接回车提交。');
        continue;
      }

      const question = visibleQuestions[index];
      const existingAnswer = answers[question.id];
      printQuestion(question, index, visibleQuestions.length, existingAnswer, options, runtime);
      const response = await rl.question('> ');
      const normalized = response.trim();

      if (!normalized) {
        if (existingAnswer !== undefined) {
          index += 1;
          continue;
        }

        console.log('请输入一个选项。');
        continue;
      }

      if (/^(b|back)$/i.test(normalized)) {
        if (index > 0) {
          index -= 1;
        } else {
          console.log('已经是第一题了。');
        }
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
      index += 1;
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
