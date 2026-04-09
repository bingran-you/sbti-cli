import vm from 'node:vm';

const TYPE_IMAGES_BLOCK_PATTERN = /const TYPE_IMAGES = \{([\s\S]*?)\n\};\n\nconst NORMAL_TYPES/;

const MIME_TYPE_TO_EXTENSION = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};
const EXTENSION_TO_MIME_TYPE = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
};

export function extractTypeImagesFromSource(sourceText) {
  const normalizedSource = String(sourceText ?? '');
  const match = normalizedSource.match(TYPE_IMAGES_BLOCK_PATTERN);

  if (!match) {
    throw new Error('Unable to locate TYPE_IMAGES in the supplied SBTI source.');
  }

  return vm.runInNewContext(`const TYPE_IMAGES = {${match[1]}\n};\nTYPE_IMAGES;`);
}

export function getImageExtensionForMimeType(mimeType) {
  const extension = MIME_TYPE_TO_EXTENSION[String(mimeType ?? '').toLowerCase()];
  if (!extension) {
    throw new Error(`Unsupported image MIME type: ${mimeType}`);
  }

  return extension;
}

export function getMimeTypeForImageExtension(extension) {
  const mimeType = EXTENSION_TO_MIME_TYPE[String(extension ?? '').toLowerCase()];
  if (!mimeType) {
    throw new Error(`Unsupported image extension: ${extension}`);
  }

  return mimeType;
}

export function parseTypeImageDataUrl(dataUrl) {
  const normalized = String(dataUrl ?? '');
  const match = normalized.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new Error('Expected a base64 image data URL.');
  }

  const [, mimeType, base64] = match;
  const extension = getImageExtensionForMimeType(mimeType);
  const buffer = Buffer.from(base64, 'base64');

  return {
    mimeType,
    extension,
    base64,
    buffer
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function buildTypeImageGalleryHtml(entries, title = 'SBTI Result Images') {
  const cards = entries.map((entry) => {
    const subtitle = entry.cn ? `${entry.code} (${entry.cn})` : entry.code;
    return `    <article class="card">
      <img src="${encodeURIComponent(entry.fileName)}" alt="${escapeHtml(subtitle)}" loading="lazy" />
      <h2>${escapeHtml(entry.code)}</h2>
      <p>${escapeHtml(entry.cn ?? '')}</p>
      <p class="meta">${escapeHtml(entry.mimeType)} · ${entry.fileName}</p>
    </article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f3efe4;
      --card: #fffaf1;
      --line: #d9cfbc;
      --text: #1f1a14;
      --muted: #7b6d58;
      --shadow: 0 10px 30px rgba(31, 26, 20, 0.08);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      background:
        radial-gradient(circle at top, rgba(227, 194, 127, 0.3), transparent 30%),
        linear-gradient(180deg, #f8f4ea 0%, var(--bg) 100%);
      color: var(--text);
    }

    main {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px 80px;
    }

    h1 {
      margin: 0 0 12px;
      font-size: clamp(2rem, 4vw, 3.5rem);
      letter-spacing: 0.04em;
    }

    .intro {
      margin: 0 0 32px;
      color: var(--muted);
      font-size: 1.05rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
    }

    .card {
      background: color-mix(in srgb, var(--card) 92%, white);
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .card img {
      display: block;
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      background: #eee7d9;
    }

    .card h2,
    .card p {
      margin: 0;
      padding-left: 16px;
      padding-right: 16px;
    }

    .card h2 {
      padding-top: 14px;
      font-size: 1.05rem;
    }

    .card p {
      padding-top: 6px;
      padding-bottom: 14px;
      color: var(--muted);
    }

    .meta {
      padding-top: 0;
      font-size: 0.88rem;
    }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p class="intro">Bundled with the offline SBTI CLI. Each card is one local result poster asset.</p>
    <section class="grid">
${cards}
    </section>
  </main>
</body>
</html>
`;
}
