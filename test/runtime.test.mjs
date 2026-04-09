import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BUNDLED_SBTI_SOURCE_URL,
  buildResultSummary,
  computeDimensionStats,
  createSeededRandom,
  createSurveySession,
  formatOptionCode,
  loadSbtiRuntime,
  patternToVector,
  rankNormalTypes
} from '../src/runtime.mjs';

function buildAnswersForPattern(runtime, pattern, drinkAnswers = { drink_gate_q1: 1 }) {
  const questionsByDimension = new Map();
  runtime.exports.questions.forEach((question) => {
    if (!questionsByDimension.has(question.dim)) {
      questionsByDimension.set(question.dim, []);
    }
    questionsByDimension.get(question.dim).push(question.id);
  });

  const levelAnswers = {
    L: [1, 1],
    M: [1, 3],
    H: [3, 3]
  };

  const answers = { ...drinkAnswers };
  runtime.exports.dimensionOrder.forEach((dimensionId, index) => {
    const level = pattern[index];
    const [firstAnswer, secondAnswer] = levelAnswers[level];
    const [firstQuestionId, secondQuestionId] = questionsByDimension.get(dimensionId);
    answers[firstQuestionId] = firstAnswer;
    answers[secondQuestionId] = secondAnswer;
  });

  return answers;
}

function toPlainValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function numberToPattern(number, length = 15) {
  const digits = new Array(length).fill('L');
  const levels = ['L', 'M', 'H'];
  let remaining = number;

  for (let index = length - 1; index >= 0; index -= 1) {
    digits[index] = levels[remaining % 3];
    remaining = Math.floor(remaining / 3);
  }

  return digits.join('');
}

function buildExpectedOutcome(runtime, answers, bestNormal) {
  const drinkTriggered =
    Number(answers[runtime.exports.DRUNK_TRIGGER_QUESTION_ID] || 0) === 2;

  if (drinkTriggered) {
    return {
      finalTypeCode: 'DRUNK',
      modeKicker: '隐藏人格已激活',
      badge: '匹配度 100% · 酒精异常因子已接管',
      sub: '乙醇亲和性过强，系统已直接跳过常规人格审判。',
      special: true,
      secondaryTypeCode: bestNormal.code
    };
  }

  if (bestNormal.similarity < 60) {
    return {
      finalTypeCode: 'HHHH',
      modeKicker: '系统强制兜底',
      badge: `标准人格库最高匹配仅 ${bestNormal.similarity}%`,
      sub: '标准人格库对你的脑回路集体罢工了，于是系统把你强制分配给了 HHHH。',
      special: true,
      secondaryTypeCode: null
    };
  }

  return {
    finalTypeCode: bestNormal.code,
    modeKicker: '你的主类型',
    badge: `匹配度 ${bestNormal.similarity}% · 精准命中 ${bestNormal.exact}/15 维`,
    sub: '维度命中度较高，当前结果可视为你的第一人格画像。',
    special: false,
    secondaryTypeCode: null
  };
}

async function loadBundledRuntime(seed = 42) {
  return loadSbtiRuntime({
    random: createSeededRandom(seed)
  });
}

test('formatOptionCode follows the website letter labels', () => {
  assert.equal(formatOptionCode(0), 'A');
  assert.equal(formatOptionCode(3), 'D');
  assert.equal(formatOptionCode(27), '28');
});

test('bundled runtime only inserts the second drink question after selecting 饮酒', async () => {
  const runtimeWithoutDrink = await loadBundledRuntime(123);
  const sessionWithoutDrink = createSurveySession(runtimeWithoutDrink);

  while (sessionWithoutDrink.getCurrentQuestion().id !== 'drink_gate_q1') {
    const currentQuestion = sessionWithoutDrink.getCurrentQuestion();
    sessionWithoutDrink.answerQuestion(currentQuestion.id, currentQuestion.options[0].value);
  }

  let visibleQuestions = sessionWithoutDrink.getVisibleQuestions();
  assert.equal(visibleQuestions.filter((question) => question.id === 'drink_gate_q2').length, 0);

  const drinkGateQuestion = sessionWithoutDrink.getCurrentQuestion();
  sessionWithoutDrink.answerQuestion(drinkGateQuestion.id, 1);
  visibleQuestions = sessionWithoutDrink.getVisibleQuestions();
  assert.equal(visibleQuestions.filter((question) => question.id === 'drink_gate_q2').length, 0);

  const runtimeWithDrink = await loadBundledRuntime(123);
  const sessionWithDrink = createSurveySession(runtimeWithDrink);

  while (sessionWithDrink.getCurrentQuestion().id !== 'drink_gate_q1') {
    const currentQuestion = sessionWithDrink.getCurrentQuestion();
    sessionWithDrink.answerQuestion(currentQuestion.id, currentQuestion.options[0].value);
  }

  sessionWithDrink.answerQuestion('drink_gate_q1', 3);
  visibleQuestions = sessionWithDrink.getVisibleQuestions();
  const drinkGateIndex = visibleQuestions.findIndex((question) => question.id === 'drink_gate_q1');

  assert.ok(drinkGateIndex >= 0);
  assert.equal(visibleQuestions[drinkGateIndex + 1].id, 'drink_gate_q2');
});

test('survey sessions stay append-only and only compute after completion', async () => {
  const runtime = await loadBundledRuntime(2048);
  const session = createSurveySession(runtime);
  const visibleQuestions = session.getVisibleQuestions();
  const firstQuestion = session.getCurrentQuestion();

  assert.equal(typeof session.reset, 'undefined');
  assert.throws(
    () => session.computeResult(),
    /All visible questions must be answered before computing a result/
  );
  assert.throws(
    () => session.answerQuestion(visibleQuestions[1].id, visibleQuestions[1].options[0].value),
    new RegExp(`Expected answer for ${firstQuestion.id}`)
  );

  session.answerQuestion(firstQuestion.id, firstQuestion.options[0].value);
  assert.throws(
    () => session.answerQuestion(firstQuestion.id, firstQuestion.options[1].value),
    /Expected answer for/
  );

  while (!session.getProgress().complete) {
    const currentQuestion = session.getCurrentQuestion();
    session.answerQuestion(currentQuestion.id, currentQuestion.options[0].value);
  }

  const result = session.computeResult();
  assert.ok(result.finalType.code);
  assert.throws(
    () => session.answerQuestion(firstQuestion.id, firstQuestion.options[0].value),
    /already been finalized/
  );
});

test('explicit dimension stats produce the expected result string grouping', async () => {
  const runtime = await loadBundledRuntime(321);
  const answers = buildAnswersForPattern(runtime, 'HMHHLLLMLHMLLLL', {
    drink_gate_q1: 1
  });
  const stats = computeDimensionStats(runtime, answers);

  assert.equal(stats.resultPattern, 'HMH-HLL-LML-HML-LLL');
  assert.deepEqual(stats.resultVector, [3, 2, 3, 3, 1, 1, 1, 2, 1, 3, 2, 1, 1, 1, 1]);
});

test('explicit normal-type ranking reproduces the bundled runtime ordering math', async () => {
  const runtime = await loadBundledRuntime(654);
  const answers = buildAnswersForPattern(runtime, 'HMHHLLLMLHMLLLL', {
    drink_gate_q1: 1
  });
  runtime.exports.app.answers = answers;

  const summary = buildResultSummary(runtime, answers);
  const manualRanking = rankNormalTypes(runtime, patternToVector('HMH-HLL-LML-HML-LLL'));

  assert.equal(summary.resultPattern, 'HMH-HLL-LML-HML-LLL');
  assert.equal(summary.bestNormal.code, manualRanking[0].code);
  assert.equal(summary.bestNormal.distance, manualRanking[0].distance);
  assert.equal(summary.bestNormal.exact, manualRanking[0].exact);
  assert.equal(summary.bestNormal.similarity, manualRanking[0].similarity);
  assert.deepEqual(
    summary.ranked.slice(0, 5).map((entry) => entry.code),
    manualRanking.slice(0, 5).map((entry) => entry.code)
  );
});

test('bundled runtime uses the DRUNK override when the hidden drink trigger is activated', async () => {
  const runtime = await loadBundledRuntime(456);
  const session = createSurveySession(runtime);
  const answers = {
    drink_gate_q1: 3,
    drink_gate_q2: 2
  };

  runtime.exports.questions.forEach((question) => {
    answers[question.id] = 3;
  });

  runtime.exports.app.answers = answers;
  const result = session.computeResult();

  assert.equal(result.finalType.code, 'DRUNK');
  assert.equal(result.special, true);
  assert.equal(result.secondaryType.code, result.bestNormal.code);
  assert.match(result.badge, /100%/);
  assert.equal(result.flags.drinkTriggered, true);
  assert.equal(result.flags.fallbackTriggered, false);
});

test('bundled runtime falls back to HHHH when the best normal match stays below 60%', async () => {
  const runtime = await loadBundledRuntime(789);
  const session = createSurveySession(runtime);
  const answers = buildAnswersForPattern(runtime, 'LLLLLLMLLHHHHML', {
    drink_gate_q1: 1
  });

  runtime.exports.app.answers = answers;
  const result = session.computeResult();

  assert.equal(result.finalType.code, 'HHHH');
  assert.equal(result.special, true);
  assert.ok(result.bestNormal.similarity < 60);
  assert.match(result.badge, /最高匹配仅/);
  assert.equal(result.flags.drinkTriggered, false);
  assert.equal(result.flags.fallbackTriggered, true);
});

test('runtime loads the bundled offline snapshot without touching fetch', async () => {
  const originalFetch = globalThis.fetch;
  let fetchCallCount = 0;
  globalThis.fetch = async () => {
    fetchCallCount += 1;
    throw new Error('fetch should not be called');
  };

  try {
    const runtime = await loadSbtiRuntime({
      random: createSeededRandom(111)
    });
    const session = createSurveySession(runtime);
    const answers = buildAnswersForPattern(runtime, 'HMHHLLLMLHMLLLL', {
      drink_gate_q1: 1
    });

    runtime.exports.app.answers = answers;
    const result = session.computeResult();

    assert.equal(runtime.sourceKind, 'bundled');
    assert.equal(runtime.sourceUrl, BUNDLED_SBTI_SOURCE_URL);
    assert.match(runtime.sourceDescription, /内置离线快照/);
    assert.equal(runtime.fallbackReason, null);
    assert.equal(runtime.exports.questions.length, 30);
    assert.equal(result.resultPattern, 'HMH-HLL-LML-HML-LLL');
    assert.equal(result.finalType.code, result.bestNormal.code);
    assert.equal(result.flags.drinkTriggered, false);
    assert.equal(fetchCallCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('50 deterministic cases keep the local scoring model aligned with the bundled runtime', async () => {
  const runtime = await loadBundledRuntime(20260409);
  const maxPatternSpace = 3 ** runtime.exports.dimensionOrder.length;
  const step = Math.floor(maxPatternSpace / 45);
  const cases = [];

  for (let index = 0; index < 45; index += 1) {
    cases.push({
      label: `generated-${index + 1}`,
      answers: buildAnswersForPattern(runtime, numberToPattern(index * step), {
        drink_gate_q1: 1
      })
    });
  }

  cases.push({
    label: 'all-high-normal',
    answers: buildAnswersForPattern(runtime, 'H'.repeat(runtime.exports.dimensionOrder.length), {
      drink_gate_q1: 1
    })
  });
  cases.push({
    label: 'known-fallback',
    answers: buildAnswersForPattern(runtime, 'LLLLLLMLLHHHHML', {
      drink_gate_q1: 1
    })
  });
  cases.push({
    label: 'gate-open-without-drunk-trigger',
    answers: buildAnswersForPattern(runtime, 'HMHHLLLMLHMLLLL', {
      drink_gate_q1: 3,
      drink_gate_q2: 1
    })
  });
  cases.push({
    label: 'drunk-override-all-high',
    answers: buildAnswersForPattern(runtime, 'H'.repeat(runtime.exports.dimensionOrder.length), {
      drink_gate_q1: 3,
      drink_gate_q2: 2
    })
  });
  cases.push({
    label: 'drunk-override-mixed',
    answers: buildAnswersForPattern(runtime, 'MLHMMHLHLHMLMHL', {
      drink_gate_q1: 3,
      drink_gate_q2: 2
    })
  });

  assert.equal(cases.length, 50);

  cases.forEach(({ label, answers }) => {
    const stats = computeDimensionStats(runtime, answers);
    const ranked = rankNormalTypes(runtime, stats.resultVector);
    const bestNormal = ranked[0];
    const expectedOutcome = buildExpectedOutcome(runtime, answers, bestNormal);

    runtime.exports.app.answers = { ...answers };
    const websiteResult = toPlainValue(runtime.exports.computeResult());

    assert.deepEqual(
      websiteResult.rawScores,
      stats.rawScores,
      `${label}: raw dimension scores diverged`
    );
    assert.deepEqual(
      websiteResult.levels,
      stats.levels,
      `${label}: level bucketing diverged`
    );
    assert.deepEqual(
      JSON.stringify(
        websiteResult.ranked.map(({ code, distance, exact, similarity }) => ({
          code,
          distance,
          exact,
          similarity
        }))
      ),
      JSON.stringify(
        ranked.map(({ code, distance, exact, similarity }) => ({
          code,
          distance,
          exact,
          similarity
        }))
      ),
      `${label}: ranked normal personalities diverged`
    );
    assert.equal(
      websiteResult.bestNormal.code,
      bestNormal.code,
      `${label}: best normal type diverged`
    );
    assert.equal(
      websiteResult.bestNormal.distance,
      bestNormal.distance,
      `${label}: best normal distance diverged`
    );
    assert.equal(
      websiteResult.bestNormal.exact,
      bestNormal.exact,
      `${label}: best normal exact-hit count diverged`
    );
    assert.equal(
      websiteResult.bestNormal.similarity,
      bestNormal.similarity,
      `${label}: best normal similarity diverged`
    );
    assert.equal(
      websiteResult.finalType.code,
      expectedOutcome.finalTypeCode,
      `${label}: final type branch diverged`
    );
    assert.equal(
      websiteResult.modeKicker,
      expectedOutcome.modeKicker,
      `${label}: result header diverged`
    );
    assert.equal(
      websiteResult.badge,
      expectedOutcome.badge,
      `${label}: result badge diverged`
    );
    assert.equal(
      websiteResult.sub,
      expectedOutcome.sub,
      `${label}: result subtext diverged`
    );
    assert.equal(
      websiteResult.special,
      expectedOutcome.special,
      `${label}: special-result flag diverged`
    );
    assert.equal(
      websiteResult.secondaryType?.code ?? null,
      expectedOutcome.secondaryTypeCode,
      `${label}: secondary type diverged`
    );
  });
});
