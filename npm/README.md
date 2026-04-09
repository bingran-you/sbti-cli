# SBTI CLI

Offline-only command-line runner for the bundled SBTI questionnaire.

This published package intentionally ships only the standalone CLI bundle and minimal package metadata, so installed artifacts do not expose repository-only provenance notes or source links.

## Install

```bash
npm install -g @bingran/sbti-cli
```

## Run

```bash
sbti-cli
```

## Package behavior

- Runs entirely from the bundled offline questionnaire snapshot
- Locks answers in one question at a time for each run
- Ships only the standalone CLI bundle plus basic package metadata
