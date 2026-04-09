import vm from 'node:vm';

export const DEFAULT_SBTI_SOURCE_URL = 'https://sbti.fancc.de5.net/main.js';
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

export async function loadSbtiRuntime({
  sourceText,
  sourceUrl = DEFAULT_SBTI_SOURCE_URL,
  random = Math.random
} = {}) {
  const source = sourceText ?? await fetchSbtiSource(sourceUrl);
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
    throw new Error(`Failed to evaluate SBTI runtime from ${sourceUrl}: ${error.message}`);
  }

  return {
    source,
    sourceUrl,
    context,
    elements,
    exports: context.__sbtiExports
  };
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
