import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_SBTI_SOURCE_URL,
  fetchSbtiSource,
  loadSbtiRuntime
} from '../src/runtime.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bundledDataPath = path.resolve(__dirname, '../src/bundled-data.mjs');

const sourceText = await fetchSbtiSource(DEFAULT_SBTI_SOURCE_URL);
const runtime = await loadSbtiRuntime({
  sourceText,
  sourceUrl: DEFAULT_SBTI_SOURCE_URL
});

const snapshot = {
  generatedFrom: runtime.sourceUrl,
  generatedAt: new Date().toISOString(),
  dimensionMeta: runtime.exports.dimensionMeta,
  questions: runtime.exports.questions,
  specialQuestions: runtime.exports.specialQuestions,
  TYPE_LIBRARY: runtime.exports.TYPE_LIBRARY,
  NORMAL_TYPES: runtime.exports.NORMAL_TYPES,
  DIM_EXPLANATIONS: runtime.exports.DIM_EXPLANATIONS,
  dimensionOrder: runtime.exports.dimensionOrder,
  DRUNK_TRIGGER_QUESTION_ID: runtime.exports.DRUNK_TRIGGER_QUESTION_ID
};

await writeFile(
  bundledDataPath,
  `export const BUNDLED_SBTI_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)};\n`,
  'utf8'
);

console.log(`Updated ${bundledDataPath}`);
