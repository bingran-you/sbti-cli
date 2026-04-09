import vm from 'node:vm';

import { BUNDLED_SBTI_SNAPSHOT } from './bundled-data.mjs';

export const DEFAULT_SBTI_SOURCE_URL = 'https://sbti.fancc.de5.net/main.js';
export const BUNDLED_SBTI_SOURCE_URL = 'bundled:sbti-main.js';
export const NORMAL_TYPE_SIMILARITY_FALLBACK_THRESHOLD = 60;
export const SIMILARITY_DISTANCE_DENOMINATOR = 30;
export const DIMENSION_GROUP_SIZE = 3;

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

export function buildBundledSbtiSource(snapshot = BUNDLED_SBTI_SNAPSHOT) {
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
  answers: {},
  previewMode: false
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

function startTest(preview = false) {
  app.previewMode = preview;
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

export const BUNDLED_SBTI_SOURCE_TEXT = buildBundledSbtiSource();
export const BUNDLED_SBTI_SOURCE_DESCRIPTION =
  `内置离线快照（基于 ${BUNDLED_SBTI_SNAPSHOT.generatedFrom}，生成于 ${BUNDLED_SBTI_SNAPSHOT.generatedAt}）`;

export function createSeededRandom(seed) {
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

export async function fetchSbtiSource(url = DEFAULT_SBTI_SOURCE_URL) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SBTI source from ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
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

function buildBundledRuntimeMetadata(reason = null) {
  return {
    source: BUNDLED_SBTI_SOURCE_TEXT,
    sourceUrl: BUNDLED_SBTI_SOURCE_URL,
    sourceKind: 'bundled',
    sourceDescription: BUNDLED_SBTI_SOURCE_DESCRIPTION,
    fallbackReason: reason
  };
}

export async function loadSbtiRuntime({
  sourceText,
  sourceUrl = DEFAULT_SBTI_SOURCE_URL,
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

  let liveSource;
  try {
    liveSource = await fetchSbtiSource(sourceUrl);
  } catch (error) {
    const bundled = buildBundledRuntimeMetadata(
      `无法加载在线题库 ${sourceUrl}，已自动切换到内置离线快照。原始错误: ${error.message}`
    );
    const evaluated = evaluateSbtiRuntimeSource(bundled.source, bundled.sourceUrl, random);
    return {
      ...bundled,
      ...evaluated
    };
  }

  try {
    const evaluated = evaluateSbtiRuntimeSource(liveSource, sourceUrl, random);
    return {
      source: liveSource,
      sourceUrl,
      sourceKind: 'remote',
      sourceDescription: sourceUrl,
      fallbackReason: null,
      ...evaluated
    };
  } catch (error) {
    const bundled = buildBundledRuntimeMetadata(
      `在线题库 ${sourceUrl} 无法解析，已自动切换到内置离线快照。原始错误: ${error.message}`
    );

    try {
      const evaluated = evaluateSbtiRuntimeSource(bundled.source, bundled.sourceUrl, random);
      return {
        ...bundled,
        ...evaluated
      };
    } catch (fallbackError) {
      throw new Error(
        `Failed to evaluate SBTI runtime from ${sourceUrl}: ${error.message}. Bundled fallback also failed: ${fallbackError.message}`
      );
    }
  }
}

export function createSurveySession(runtime, { preview = false } = {}) {
  if (!runtime?.exports) {
    throw new Error('A loaded SBTI runtime is required.');
  }

  runtime.exports.startTest(preview);

  return {
    preview,
    getAnswers() {
      return toPlainValue(runtime.exports.app.answers);
    },
    getVisibleQuestions() {
      return toPlainValue(runtime.exports.getVisibleQuestions());
    },
    getProgress() {
      const visibleQuestions = runtime.exports.getVisibleQuestions();
      const total = visibleQuestions.length;
      const done = visibleQuestions.filter((question) => runtime.exports.app.answers[question.id] !== undefined).length;
      return {
        done,
        total,
        complete: total > 0 && done === total
      };
    },
    answerQuestion(questionId, value) {
      const numericValue = Number(value);
      runtime.exports.app.answers[questionId] = numericValue;

      if (questionId === 'drink_gate_q1' && numericValue !== 3) {
        delete runtime.exports.app.answers.drink_gate_q2;
      }

      return this.getProgress();
    },
    computeResult() {
      return buildResultSummary(runtime, runtime.exports.app.answers);
    },
    reset() {
      runtime.exports.startTest(preview);
      return this.getVisibleQuestions();
    }
  };
}

export function formatOptionCode(index) {
  return OPTION_CODES[index] ?? String(index + 1);
}

export function scoreToLevel(score) {
  if (score <= 3) {
    return 'L';
  }

  if (score === 4) {
    return 'M';
  }

  return 'H';
}

export function levelToNumber(level) {
  const numericLevel = LEVEL_TO_NUMBER[level];
  if (!numericLevel) {
    throw new Error(`Unknown level: ${level}`);
  }

  return numericLevel;
}

export function patternToLetters(pattern) {
  return String(pattern).replace(/-/g, '').split('');
}

export function patternToVector(pattern) {
  return patternToLetters(pattern).map(levelToNumber);
}

export function lettersToPattern(letters, groupSize = DIMENSION_GROUP_SIZE) {
  const groups = [];

  for (let index = 0; index < letters.length; index += groupSize) {
    groups.push(letters.slice(index, index + groupSize).join(''));
  }

  return groups.join('-');
}

export function buildResultPattern(levels, dimensionOrder) {
  return lettersToPattern(dimensionOrder.map((dimensionId) => levels[dimensionId]));
}

export function computeDimensionStats(runtime, answersInput = runtime.exports.app.answers) {
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

export function rankNormalTypes(runtime, resultPattern) {
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

export function buildResultSummary(runtime, answersInput = runtime.exports.app.answers) {
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

export function getQuestionMetaLabel(question, { preview = false, dimensionMeta = {} } = {}) {
  if (question.special) {
    return '补充题';
  }

  if (!preview) {
    return '维度已隐藏';
  }

  return dimensionMeta[question.dim]?.name ?? '维度已隐藏';
}

export function findOptionValue(question, rawInput) {
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
