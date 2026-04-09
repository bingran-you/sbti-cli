import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildResultSummary,
  computeDimensionStats,
  createSeededRandom,
  createSurveySession,
  DEFAULT_SBTI_SOURCE_URL,
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

async function loadLiveRuntime(t, seed = 42) {
  try {
    return await loadSbtiRuntime({
      random: createSeededRandom(seed)
    });
  } catch (error) {
    t.skip(`Unable to reach ${DEFAULT_SBTI_SOURCE_URL}: ${error.message}`);
    return null;
  }
}

test('formatOptionCode follows the website letter labels', () => {
  assert.equal(formatOptionCode(0), 'A');
  assert.equal(formatOptionCode(3), 'D');
  assert.equal(formatOptionCode(27), '28');
});

test('live runtime only inserts the second drink question after selecting 饮酒', async (t) => {
  const runtime = await loadLiveRuntime(t, 123);
  if (!runtime) {
    return;
  }

  const session = createSurveySession(runtime);
  let visibleQuestions = session.getVisibleQuestions();

  assert.equal(visibleQuestions.filter((question) => question.id === 'drink_gate_q2').length, 0);

  session.answerQuestion('drink_gate_q1', 1);
  visibleQuestions = session.getVisibleQuestions();
  assert.equal(visibleQuestions.filter((question) => question.id === 'drink_gate_q2').length, 0);

  session.answerQuestion('drink_gate_q1', 3);
  visibleQuestions = session.getVisibleQuestions();
  const drinkGateIndex = visibleQuestions.findIndex((question) => question.id === 'drink_gate_q1');

  assert.ok(drinkGateIndex >= 0);
  assert.equal(visibleQuestions[drinkGateIndex + 1].id, 'drink_gate_q2');
});

test('explicit dimension stats produce the expected result string grouping', async (t) => {
  const runtime = await loadLiveRuntime(t, 321);
  if (!runtime) {
    return;
  }

  const answers = buildAnswersForPattern(runtime, 'HMHHLLLMLHMLLLL', {
    drink_gate_q1: 1
  });
  const stats = computeDimensionStats(runtime, answers);

  assert.equal(stats.resultPattern, 'HMH-HLL-LML-HML-LLL');
  assert.deepEqual(stats.resultVector, [3, 2, 3, 3, 1, 1, 1, 2, 1, 3, 2, 1, 1, 1, 1]);
});

test('explicit normal-type ranking reproduces the website ordering math', async (t) => {
  const runtime = await loadLiveRuntime(t, 654);
  if (!runtime) {
    return;
  }

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

test('live runtime uses the DRUNK override when the hidden drink trigger is activated', async (t) => {
  const runtime = await loadLiveRuntime(t, 456);
  if (!runtime) {
    return;
  }

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

test('live runtime falls back to HHHH when the best normal match stays below 60%', async (t) => {
  const runtime = await loadLiveRuntime(t, 789);
  if (!runtime) {
    return;
  }

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
