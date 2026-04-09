#!/usr/bin/env node

import vm from 'node:vm';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';
import { gunzipSync } from 'node:zlib';

const BUNDLED_SBTI_SNAPSHOT = JSON.parse(
  gunzipSync(Buffer.from('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', 'base64')).toString('utf8')
);

const BUNDLED_SBTI_SOURCE_URL = 'bundled:offline-survey';
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
  return `// Built-in offline snapshot
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
const BUNDLED_SBTI_SOURCE_DESCRIPTION = '内置离线题库';

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

  let computedResult;
  try {
    computedResult = toPlainValue(runtime.exports.computeResult());
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
    ...computedResult,
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
  sbti-cli
  sbti-cli --seed 42

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
