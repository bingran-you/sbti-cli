#!/usr/bin/env node

import vm from 'node:vm';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';
import { gunzipSync } from 'node:zlib';

const BUNDLED_SBTI_SNAPSHOT = JSON.parse(
  gunzipSync(Buffer.from('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', 'base64')).toString('utf8')
);

const BUNDLED_SBTI_SOURCE_URL = 'bundled:sbti-main.js';
const NORMAL_TYPE_SIMILARITY_FALLBACK_THRESHOLD = 60;
const SIMILARITY_DISTANCE_DENOMINATOR = 30;
const DIMENSION_GROUP_SIZE = 3;

const OPTION_CODES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LEVEL_TO_NUMBER = { L: 1, M: 2, H: 3 };

function createClassListStub() {
  return {
    add() {},
    remove() {},
    toggle() {}
  };
}

function createElementStub(tagName = 'div') {
  return {
    tagName: String(tagName).toUpperCase(),
    className: '',
    classList: createClassListStub(),
    style: {},
    children: [],
    dataset: {},
    disabled: false,
    innerHTML: '',
    textContent: '',
    alt: '',
    src: '',
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
    removeEventListener() {},
    setAttribute(name, value) {
      this[name] = value;
    },
    removeAttribute(name) {
      delete this[name];
    }
  };
}

function createDocumentStub() {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, createElementStub('div'));
      }
      return elements.get(id);
    },
    createElement(tagName) {
      return createElementStub(tagName);
    }
  };

  return { document, elements };
}

function toPlainValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function serializeBundledValue(value) {
  return JSON.stringify(value, null, 2);
}

function buildBundledSbtiSource(snapshot = BUNDLED_SBTI_SNAPSHOT) {
  return `// Built-in offline snapshot generated from ${snapshot.generatedFrom} at ${snapshot.generatedAt}
const dimensionMeta = ${serializeBundledValue(snapshot.dimensionMeta)};
const questions = ${serializeBundledValue(snapshot.questions)};
const specialQuestions = ${serializeBundledValue(snapshot.specialQuestions)};
const TYPE_LIBRARY = ${serializeBundledValue(snapshot.TYPE_LIBRARY)};
const NORMAL_TYPES = ${serializeBundledValue(snapshot.NORMAL_TYPES)};
const DIM_EXPLANATIONS = ${serializeBundledValue(snapshot.DIM_EXPLANATIONS)};
const dimensionOrder = ${serializeBundledValue(snapshot.dimensionOrder)};
const DRUNK_TRIGGER_QUESTION_ID = ${serializeBundledValue(snapshot.DRUNK_TRIGGER_QUESTION_ID)};

const app = {
  shuffledQuestions: [],
  answers: {}
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getVisibleQuestions() {
  const visible = [...app.shuffledQuestions];
  const gateIndex = visible.findIndex(q => q.id === 'drink_gate_q1');
  if (gateIndex !== -1 && app.answers['drink_gate_q1'] === 3) {
    visible.splice(gateIndex + 1, 0, specialQuestions[1]);
  }
  return visible;
}

function sumToLevel(score) {
  if (score <= 3) return 'L';
  if (score === 4) return 'M';
  return 'H';
}

function levelNum(level) {
  return { L: 1, M: 2, H: 3 }[level];
}

function parsePattern(pattern) {
  return pattern.replace(/-/g, '').split('');
}

function getDrunkTriggered() {
  return app.answers[DRUNK_TRIGGER_QUESTION_ID] === 2;
}

function computeResult() {
  const rawScores = {};
  const levels = {};
  Object.keys(dimensionMeta).forEach(dim => { rawScores[dim] = 0; });

  questions.forEach(q => {
    rawScores[q.dim] += Number(app.answers[q.id] || 0);
  });

  Object.entries(rawScores).forEach(([dim, score]) => {
    levels[dim] = sumToLevel(score);
  });

  const userVector = dimensionOrder.map(dim => levelNum(levels[dim]));
  const ranked = NORMAL_TYPES.map(type => {
    const vector = parsePattern(type.pattern).map(levelNum);
    let distance = 0;
    let exact = 0;
    for (let i = 0; i < vector.length; i++) {
      const diff = Math.abs(userVector[i] - vector[i]);
      distance += diff;
      if (diff === 0) exact += 1;
    }
    const similarity = Math.max(0, Math.round((1 - distance / 30) * 100));
    return { ...type, ...TYPE_LIBRARY[type.code], distance, exact, similarity };
  }).sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (b.exact !== a.exact) return b.exact - a.exact;
    return b.similarity - a.similarity;
  });

  const bestNormal = ranked[0];
  const drunkTriggered = getDrunkTriggered();

  let finalType;
  let modeKicker = '你的主类型';
  let badge = \`匹配度 \${bestNormal.similarity}% · 精准命中 \${bestNormal.exact}/15 维\`;
  let sub = '维度命中度较高，当前结果可视为你的第一人格画像。';
  let special = false;
  let secondaryType = null;

  if (drunkTriggered) {
    finalType = TYPE_LIBRARY.DRUNK;
    secondaryType = bestNormal;
    modeKicker = '隐藏人格已激活';
    badge = '匹配度 100% · 酒精异常因子已接管';
    sub = '乙醇亲和性过强，系统已直接跳过常规人格审判。';
    special = true;
  } else if (bestNormal.similarity < 60) {
    finalType = TYPE_LIBRARY.HHHH;
    modeKicker = '系统强制兜底';
    badge = \`标准人格库最高匹配仅 \${bestNormal.similarity}%\`;
    sub = '标准人格库对你的脑回路集体罢工了，于是系统把你强制分配给了 HHHH。';
    special = true;
  } else {
    finalType = bestNormal;
  }

  return {
    rawScores,
    levels,
    ranked,
    bestNormal,
    finalType,
    modeKicker,
    badge,
    sub,
    special,
    secondaryType
  };
}

function startTest() {
  app.answers = {};
  const shuffledRegular = shuffle(questions);
  const insertIndex = Math.floor(Math.random() * shuffledRegular.length) + 1;
  app.shuffledQuestions = [
    ...shuffledRegular.slice(0, insertIndex),
    specialQuestions[0],
    ...shuffledRegular.slice(insertIndex)
  ];
}
`;
}

const BUNDLED_SBTI_SOURCE_TEXT = buildBundledSbtiSource();
const BUNDLED_SBTI_SOURCE_DESCRIPTION =
  `内置离线快照（基于 ${BUNDLED_SBTI_SNAPSHOT.generatedFrom}，生成于 ${BUNDLED_SBTI_SNAPSHOT.generatedAt}）`;

function createSeededRandom(seed) {
  const normalized = Number(seed);
  let state = Number.isFinite(normalized) ? normalized >>> 0 : 0;

  if (state === 0) {
    state = 0x6d2b79f5;
  }

  return function seededRandom() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRuntimeEvaluationContext(random = Math.random) {
  const { document, elements } = createDocumentStub();
  const math = Object.create(Math);
  math.random = typeof random === 'function' ? random : Math.random;

  const window = {
    document,
    scrollTo() {},
    addEventListener() {},
    removeEventListener() {}
  };

  const context = vm.createContext({
    console,
    document,
    Math: math,
    window,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  });

  return {
    context,
    elements
  };
}

function evaluateSbtiRuntimeSource(source, sourceUrl, random = Math.random) {
  const { context, elements } = createRuntimeEvaluationContext(random);

  const instrumentedSource = `${source}
globalThis.__sbtiExports = {
  dimensionMeta,
  questions,
  specialQuestions,
  TYPE_LIBRARY,
  NORMAL_TYPES,
  DIM_EXPLANATIONS,
  dimensionOrder,
  DRUNK_TRIGGER_QUESTION_ID,
  app,
  getVisibleQuestions,
  startTest,
  computeResult
};
`;

  try {
    vm.runInContext(instrumentedSource, context, {
      filename: sourceUrl,
      timeout: 5000
    });
  } catch (error) {
    throw new Error(error.message);
  }

  return {
    context,
    elements,
    exports: context.__sbtiExports
  };
}

function buildBundledRuntimeMetadata() {
  return {
    source: BUNDLED_SBTI_SOURCE_TEXT,
    sourceUrl: BUNDLED_SBTI_SOURCE_URL,
    sourceKind: 'bundled',
    sourceDescription: BUNDLED_SBTI_SOURCE_DESCRIPTION,
    fallbackReason: null
  };
}

async function loadSbtiRuntime({
  sourceText,
  sourceUrl = BUNDLED_SBTI_SOURCE_URL,
  random = Math.random
} = {}) {
  if (sourceText !== null && sourceText !== undefined) {
    const evaluated = evaluateSbtiRuntimeSource(sourceText, sourceUrl, random);
    return {
      source: sourceText,
      sourceUrl,
      sourceKind: 'provided',
      sourceDescription: sourceUrl,
      fallbackReason: null,
      ...evaluated
    };
  }

  const bundled = buildBundledRuntimeMetadata();
  const evaluated = evaluateSbtiRuntimeSource(bundled.source, bundled.sourceUrl, random);
  return {
    ...bundled,
    ...evaluated
  };
}

function createSurveySession(runtime) {
  if (!runtime?.exports) {
    throw new Error('A loaded SBTI runtime is required.');
  }

  runtime.exports.startTest(false);

  let finalized = false;

  const getSessionState = () => {
    const visibleQuestions = runtime.exports.getVisibleQuestions();
    const total = visibleQuestions.length;
    const done = visibleQuestions.filter((question) => runtime.exports.app.answers[question.id] !== undefined).length;
    const nextQuestion =
      visibleQuestions.find((question) => runtime.exports.app.answers[question.id] === undefined) ?? null;

    return {
      visibleQuestions,
      total,
      done,
      complete: total > 0 && done === total,
      nextQuestion
    };
  };

  return {
    getAnswers() {
      return toPlainValue(runtime.exports.app.answers);
    },
    getCurrentQuestion() {
      return toPlainValue(getSessionState().nextQuestion);
    },
    getVisibleQuestions() {
      return toPlainValue(getSessionState().visibleQuestions);
    },
    getProgress() {
      const { done, total, complete } = getSessionState();
      return { done, total, complete };
    },
    answerQuestion(questionId, value) {
      if (finalized) {
        throw new Error('This survey session has already been finalized.');
      }

      const { nextQuestion, complete } = getSessionState();
      if (complete || !nextQuestion) {
        throw new Error('All questions have already been answered.');
      }

      if (questionId !== nextQuestion.id) {
        throw new Error(`Expected answer for ${nextQuestion.id}, received ${questionId}.`);
      }

      const numericValue = Number(value);
      runtime.exports.app.answers[questionId] = numericValue;

      if (questionId === 'drink_gate_q1' && numericValue !== 3) {
        delete runtime.exports.app.answers.drink_gate_q2;
      }

      return this.getProgress();
    },
    computeResult() {
      const progress = this.getProgress();
      if (!progress.complete) {
        throw new Error('All visible questions must be answered before computing a result.');
      }

      finalized = true;
      return buildResultSummary(runtime, runtime.exports.app.answers);
    }
  };
}

function formatOptionCode(index) {
  return OPTION_CODES[index] ?? String(index + 1);
}

function scoreToLevel(score) {
  if (score <= 3) {
    return 'L';
  }

  if (score === 4) {
    return 'M';
  }

  return 'H';
}

function levelToNumber(level) {
  const numericLevel = LEVEL_TO_NUMBER[level];
  if (!numericLevel) {
    throw new Error(`Unknown level: ${level}`);
  }

  return numericLevel;
}

function patternToLetters(pattern) {
  return String(pattern).replace(/-/g, '').split('');
}

function patternToVector(pattern) {
  return patternToLetters(pattern).map(levelToNumber);
}

function lettersToPattern(letters, groupSize = DIMENSION_GROUP_SIZE) {
  const groups = [];

  for (let index = 0; index < letters.length; index += groupSize) {
    groups.push(letters.slice(index, index + groupSize).join(''));
  }

  return groups.join('-');
}

function buildResultPattern(levels, dimensionOrder) {
  return lettersToPattern(dimensionOrder.map((dimensionId) => levels[dimensionId]));
}

function computeDimensionStats(runtime, answersInput = runtime.exports.app.answers) {
  const rawAnswers = answersInput ?? {};
  const answers = toPlainValue(rawAnswers);
  const rawScores = {};
  const levels = {};

  runtime.exports.dimensionOrder.forEach((dimensionId) => {
    rawScores[dimensionId] = 0;
  });

  runtime.exports.questions.forEach((question) => {
    rawScores[question.dim] += Number(answers[question.id] || 0);
  });

  runtime.exports.dimensionOrder.forEach((dimensionId) => {
    levels[dimensionId] = scoreToLevel(rawScores[dimensionId]);
  });

  const resultPattern = buildResultPattern(levels, runtime.exports.dimensionOrder);
  const resultVector = patternToVector(resultPattern);

  return {
    answers,
    rawScores,
    levels,
    resultPattern,
    resultVector
  };
}

function rankNormalTypes(runtime, resultPattern) {
  const userVector = Array.isArray(resultPattern) ? resultPattern : patternToVector(resultPattern);

  return runtime.exports.NORMAL_TYPES.map((type) => {
    const vector = patternToVector(type.pattern);
    let distance = 0;
    let exact = 0;

    for (let index = 0; index < vector.length; index += 1) {
      const diff = Math.abs(userVector[index] - vector[index]);
      distance += diff;

      if (diff === 0) {
        exact += 1;
      }
    }

    const similarity = Math.max(
      0,
      Math.round((1 - distance / SIMILARITY_DISTANCE_DENOMINATOR) * 100)
    );

    return {
      ...type,
      ...runtime.exports.TYPE_LIBRARY[type.code],
      distance,
      exact,
      similarity
    };
  }).sort((left, right) => {
    if (left.distance !== right.distance) {
      return left.distance - right.distance;
    }

    if (right.exact !== left.exact) {
      return right.exact - left.exact;
    }

    return right.similarity - left.similarity;
  });
}

function buildResultSummary(runtime, answersInput = runtime.exports.app.answers) {
  const dimensionStats = computeDimensionStats(runtime, answersInput);
  const previousAnswers = runtime.exports.app.answers;
  runtime.exports.app.answers = { ...dimensionStats.answers };

  let websiteResult;
  try {
    websiteResult = toPlainValue(runtime.exports.computeResult());
  } finally {
    runtime.exports.app.answers = previousAnswers;
  }

  const ranked = rankNormalTypes(runtime, dimensionStats.resultVector);
  const bestNormal = ranked[0];
  const drinkTriggered =
    Number(dimensionStats.answers[runtime.exports.DRUNK_TRIGGER_QUESTION_ID] || 0) === 2;
  const fallbackTriggered =
    !drinkTriggered && bestNormal.similarity < NORMAL_TYPE_SIMILARITY_FALLBACK_THRESHOLD;

  return {
    ...websiteResult,
    ...dimensionStats,
    ranked,
    bestNormal,
    normalTypeCount: runtime.exports.NORMAL_TYPES.length,
    specialTypeCount: 2,
    flags: {
      drinkTriggered,
      fallbackTriggered
    }
  };
}

function getQuestionMetaLabel(question) {
  if (question.special) {
    return '补充题';
  }

  return '维度已隐藏';
}

function findOptionValue(question, rawInput) {
  const normalized = String(rawInput ?? '').trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  const codeIndex = OPTION_CODES.indexOf(normalized);
  if (codeIndex !== -1 && question.options[codeIndex]) {
    return question.options[codeIndex].value;
  }

  const numericValue = Number(normalized);
  if (Number.isInteger(numericValue) && question.options.some((option) => option.value === numericValue)) {
    return numericValue;
  }

  return null;
}

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
