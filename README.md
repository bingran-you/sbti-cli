# SBTI CLI

Standalone CLI for the public SBTI survey at `https://sbti.fancc.de5.net/`.

## Why this repo exists

The goal is to mirror the website behavior as closely as possible without embedding the survey logic into another project.

Instead of hand-copying the question bank and scoring logic, this CLI:

- fetches the live `main.js` from the survey site by default
- falls back to a bundled offline snapshot if the site is down or unreachable
- evaluates it in a small sandbox
- reuses the website's own question order shuffle, drink-question branch, scoring, ranking, and special overrides

That keeps the terminal behavior aligned with the website even if the website logic changes.

## Run

```bash
npm run sbti
```

or

```bash
node src/cli.mjs
```

## Useful flags

```bash
npm run sbti -- --seed 42
npm run sbti -- --json
npm run sbti -- --preview-dimensions
npm run sbti -- --source-file /path/to/main.js
npm run sbti -- --source-url https://sbti.fancc.de5.net/main.js
npm run export-images
```

## Offline behavior

- A normal run still prefers the live website logic first.
- If fetching or evaluating the live `main.js` fails, the CLI automatically switches to the bundled offline snapshot and tells you it did so.
- You can refresh that bundled snapshot later with:

```bash
npm run refresh-snapshot
```

## Result images

- The website stores its result posters as embedded base64 data URLs inside `main.js`, not as separate image files.
- You can extract all of them into local files with:

```bash
npm run export-images
```

- That writes:
  - one image file per result type under `assets/type-images/`
  - `assets/type-images/manifest.json`
  - `assets/type-images/index.html` as a local gallery

## Notes on fidelity

- The website shows one long page of all questions, while the CLI asks them one at a time.
- The CLI still uses the same underlying website logic for:
  - regular question shuffle
  - random insertion point of the first drink gate question
  - conditional reveal of the second drink question
  - dimension scoring
  - type ranking
  - `DRUNK` override
  - `HHHH` fallback

## Scoring model

- There are 15 dimensions, with 2 regular questions per dimension.
- Each regular question contributes `1`, `2`, or `3` points to its dimension.
- Each dimension total maps to a letter:
  - `2` or `3` -> `L`
  - `4` -> `M`
  - `5` or `6` -> `H`
- The 15 letters are grouped into a result string such as `HMH-HLL-LML-HML-LLL`.
- The CLI now shows that result string directly.

## Ranking model

- Each of the 25 normal personalities has a standard result string.
- The CLI converts letters with `L=1`, `M=2`, `H=3`.
- For each normal personality it calculates:
  - `总差值`: the sum of absolute per-dimension differences
  - `精准命中`: how many of the 15 dimensions have zero difference
  - `相似度`: `max(0, round((1 - d / 30) * 100))`
- Normal personalities are sorted by:
  - smaller `总差值`
  - then higher `精准命中`
  - then higher `相似度`
- `DRUNK` still overrides normal ranking when the hidden drink trigger is hit.
- `HHHH` still overrides normal ranking when the best normal similarity is below `60%`.

## Test

```bash
npm test
```

The test suite includes both:

- offline fallback coverage that does not need the website
- live parity checks that hit the public survey script and skip cleanly if the site is unavailable
