<h1 align="center">SBTI CLI · Website-Equivalent Command-Line Runner</h1>

<p align="center">
  <em>Run the SBTI survey in your terminal while staying as close as possible to the website's own runtime and result assets.</em><br>
  A Node.js CLI with <strong>live sync</strong>, <strong>offline fallback</strong>, and <strong>result-image export</strong>.
</p>

<p align="center">
  <a href="https://sbti.fancc.de5.net"><img alt="Original test" src="https://img.shields.io/badge/original-sbti.fancc.de5.net-4CAF50?style=flat-square"></a>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square">
  <img alt="Runtime mode" src="https://img.shields.io/badge/runtime-live%20%2B%20offline-blue?style=flat-square">
  <img alt="Result images" src="https://img.shields.io/badge/result%20images-27-orange?style=flat-square">
  <img alt="Questions" src="https://img.shields.io/badge/questions-30%20%2B%201%20hidden-purple?style=flat-square">
  <img alt="Language" src="https://img.shields.io/badge/language-English%20%2F%20简体中文-red?style=flat-square">
</p>

<p align="center">
  <img src="assets/type-images/CTRL.png" width="130" alt="CTRL">
  <img src="assets/type-images/BOSS.png" width="130" alt="BOSS">
  <img src="assets/type-images/SEXY.png" width="130" alt="SEXY">
  <img src="assets/type-images/MALO.png" width="130" alt="MALO">
  <img src="assets/type-images/DRUNK.png" width="130" alt="DRUNK">
  <img src="assets/type-images/HHHH.png" width="130" alt="HHHH">
</p>

<p align="center">
  <strong>Language / 语言：</strong>
  <a href="#english">English</a>
  ·
  <a href="#简体中文">简体中文</a>
</p>

---

<a id="english"></a>

## English

Quick switch: [Jump to 简体中文](#简体中文)

### 📖 Table of Contents

- [What Is This](#-what-is-this)
- [Installation & Setup](#-installation--setup)
- [Using the CLI](#-using-the-cli)
- [Core Capabilities](#-core-capabilities)
- [Result Images & Offline Resources](#-result-images--offline-resources)
- [Data Sources & How It Works](#-data-sources--how-it-works)
- [Acknowledgements](#-acknowledgements)
- [License](#-license)

---

## 🎯 What Is This

This repository turns [**sbti.fancc.de5.net**](https://sbti.fancc.de5.net) into a local command-line runner. It does not hand-reimplement a “similar” survey; instead, it tries to reuse the website's own `main.js` runtime whenever possible, so the CLI stays aligned with the original behavior.

Key traits:

- 🎲 **Website-equivalent question flow**: shuffled regular questions, drink-gate insertion, and hidden-question reveal follow the same runtime logic
- 📊 **Website-equivalent scoring**: 15-dimension scoring, H / M / L bucketing, 25 normal-type ranking, `DRUNK` override, and `HHHH` fallback stay aligned with the site
- 📴 **Offline-safe execution**: the CLI prefers the live website first, then automatically falls back to a bundled local snapshot if the site is unavailable
- 🖼️ **Exportable result posters**: all 27 website poster images can be decoded from `main.js` into local files
- ✅ **Regression coverage**: the repo includes live parity tests, offline fallback tests, and a 50-case result regression suite

If you want to:

- take the SBTI test from a terminal
- inspect how the result logic works
- keep using it while the website is down
- export the official result posters locally

this repo is built for exactly that.

---

## 🧭 Installation & Setup

Getting started only takes four steps:

| Step | What to do |
|---|---|
| **1️⃣ Install Node.js** | Use **Node.js 18+** so `node` and `npm` are available |
| **2️⃣ Clone the repo** | Download this repository locally |
| **3️⃣ Install dependencies** | Run `npm install` |
| **4️⃣ Verify the setup** | Run `npm test` to confirm the CLI and fallback paths work |

```bash
git clone https://github.com/bingran-you/sbti-cli.git
cd sbti-cli
npm install
npm test
```

After setup, start the CLI with:

```bash
npm run sbti
```

or:

```bash
node src/cli.mjs
```

> 💡 There is no build step, no database, no browser driver, and no `.env` file required. If Node.js is installed, you can run the project.

---

## 🧪 Using the CLI

### Common Commands

| Command | Purpose |
|---|---|
| `npm run sbti` | Start a normal interactive run |
| `npm run sbti -- --seed 42` | Use a deterministic shuffle seed |
| `npm run sbti -- --json` | Print the final result as JSON |
| `npm run sbti -- --preview-dimensions` | Show dimension labels while answering |
| `npm run sbti -- --source-file ./main.js` | Load survey logic from a local `main.js` |
| `npm run sbti -- --source-url https://.../main.js` | Load survey logic from a custom remote script |
| `npm run export-images` | Export all 27 result posters and build a local gallery |
| `npm run refresh-snapshot` | Refresh the bundled offline snapshot from the live site |

### Interactive Controls

Once the CLI starts, you answer one question at a time:

| Input | Action |
|---|---|
| `A / B / C / D` | Select the current option |
| `b` | Go back to the previous question |
| `Enter` | Keep the current answer and move on |
| `q` | Quit without submitting |
| `question number` | After finishing, jump back to a specific question |

### Typical Run

```bash
npm run sbti
```

```text
SBTI CLI
Question source: https://sbti.fancc.de5.net/main.js

Question 1 / 31 · dimension hidden
...

Enter A/B/C/D, or b to go back.
> C
```

If the live site cannot be loaded, the CLI automatically switches to the bundled offline snapshot and prints a clear notice before the questionnaire starts.

---

## 🧬 Core Capabilities

<table>
<tr>
  <th>Area</th>
  <th>Capability</th>
  <th>Details</th>
</tr>
<tr>
  <td><strong>🎯 Live website runtime</strong></td>
  <td>Loads the real <code>main.js</code> first</td>
  <td>The CLI reuses the website's own flow, scoring, and special branches whenever the live script is available</td>
</tr>
<tr>
  <td><strong>🛟 Offline fallback</strong></td>
  <td>Bundled snapshot takes over automatically</td>
  <td>If the website is down, slow, or broken, the CLI still works without manual intervention</td>
</tr>
<tr>
  <td><strong>🖼️ Result-image export</strong></td>
  <td>27 embedded posters can be extracted</td>
  <td>The repo can generate local image files, a JSON manifest, and an HTML gallery</td>
</tr>
<tr>
  <td><strong>🧪 Regression tests</strong></td>
  <td>Live + offline verification</td>
  <td>Includes runtime parity, 50 deterministic result cases, image extraction checks, and fallback coverage</td>
</tr>
<tr>
  <td><strong>🧰 Scriptable runtime API</strong></td>
  <td>Importable utilities for tooling</td>
  <td>You can reuse <code>loadSbtiRuntime()</code>, <code>buildResultSummary()</code>, and image helpers in custom scripts</td>
</tr>
</table>

---

## 🎭 Result Images & Offline Resources

<table>
  <tr>
    <td align="center" width="33%">
      <a href="assets/type-images/index.html"><img src="assets/type-images/CTRL.png" width="180"><br><strong>Local result gallery</strong></a><br>
      <sub>An HTML gallery generated from the extracted poster files</sub>
    </td>
    <td align="center" width="33%">
      <a href="assets/type-images/manifest.json"><img src="assets/type-images/BOSS.png" width="180"><br><strong>Image manifest</strong></a><br>
      <sub>File names, MIME types, and sizes for all exported posters</sub>
    </td>
    <td align="center" width="33%">
      <a href="src/bundled-data.mjs"><img src="assets/type-images/SEXY.png" width="180"><br><strong>Offline snapshot</strong></a><br>
      <sub>The built-in survey data used when the website cannot be reached</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="scripts/export-type-images.mjs"><img src="assets/type-images/MALO.png" width="180"><br><strong>Image export script</strong></a><br>
      <sub>Decodes <code>TYPE_IMAGES</code> from <code>main.js</code> into local files</sub>
    </td>
    <td align="center">
      <a href="scripts/update-bundled-data.mjs"><img src="assets/type-images/DRUNK.png" width="180"><br><strong>Snapshot refresh script</strong></a><br>
      <sub>Updates the bundled offline snapshot from the live website</sub>
    </td>
    <td align="center">
      <a href="test/runtime.test.mjs"><img src="assets/type-images/HHHH.png" width="180"><br><strong>Parity tests</strong></a><br>
      <sub>Checks that CLI results stay aligned with the website logic</sub>
    </td>
  </tr>
</table>

### Export All Result Images

```bash
npm run export-images
```

This generates:

- [`assets/type-images/index.html`](assets/type-images/index.html) — local gallery
- [`assets/type-images/manifest.json`](assets/type-images/manifest.json) — poster manifest
- [`assets/type-images/`](assets/type-images/) — all decoded `.png` / `.jpg` files

### Refresh the Offline Snapshot

```bash
npm run refresh-snapshot
```

That command pulls the latest live `main.js` and rewrites [`src/bundled-data.mjs`](src/bundled-data.mjs) so the offline mode stays as current as possible.

---

## 🔬 Data Sources & How It Works

### Why It Can Match the Website So Closely

The website packs its survey logic into `main.js`. This repository uses [`src/runtime.mjs`](src/runtime.mjs) plus Node.js `vm` sandboxing to evaluate that script in a tiny fake browser environment, then expose the internal constants and result helpers for local use.

The CLI therefore prefers the same runtime objects the site uses:

| Runtime object | Content |
|---|---|
| `dimensionMeta` | Chinese labels and model groups for the 15 dimensions |
| `questions` | The 30 regular questions |
| `specialQuestions` | The drink-gate question set |
| `TYPE_LIBRARY` | Codes, names, intros, and full descriptions for all 27 result types |
| `NORMAL_TYPES` | The 25 normal H / M / L templates |
| `DIM_EXPLANATIONS` | Dimension explanations for each L / M / H tier |
| `computeResult()` | The website's own result-selection branch logic |

That is why the CLI can stay aligned with:

- question shuffle
- drink-gate insertion and hidden question reveal
- 15-dimension scoring and bucketing
- normal-type ranking
- `DRUNK` override
- `HHHH` low-similarity fallback

### Where the Poster Art Comes From

The website also embeds a `TYPE_IMAGES` object directly inside `main.js`. All 27 posters are stored as `data:image/png;base64,...` or `data:image/jpeg;base64,...`. [`src/type-images.mjs`](src/type-images.mjs) extracts those images, and [`scripts/export-type-images.mjs`](scripts/export-type-images.mjs) writes them out as local files.

### Most Important Files in This Repo

- [`src/cli.mjs`](src/cli.mjs) — CLI entry point and interactive questionnaire flow
- [`src/runtime.mjs`](src/runtime.mjs) — live runtime loading, sandbox evaluation, offline fallback, and result summarization
- [`src/bundled-data.mjs`](src/bundled-data.mjs) — bundled offline snapshot
- [`src/type-images.mjs`](src/type-images.mjs) — `TYPE_IMAGES` parsing and image helpers
- [`scripts/export-type-images.mjs`](scripts/export-type-images.mjs) — poster export and gallery generation
- [`scripts/update-bundled-data.mjs`](scripts/update-bundled-data.mjs) — offline snapshot refresh
- [`test/runtime.test.mjs`](test/runtime.test.mjs) — live parity and offline fallback tests
- [`test/type-images.test.mjs`](test/type-images.test.mjs) — image extraction coverage

---

## 🙏 Acknowledgements

<table>
  <tr>
    <th>Project</th>
    <th>Author</th>
    <th>Contribution</th>
  </tr>
  <tr>
    <td><a href="https://sbti.fancc.de5.net"><strong>SBTI Personality Test</strong></a></td>
    <td>Bilibili <a href="https://space.bilibili.com/417038183">@蛆肉儿串儿</a></td>
    <td>Original survey author and source of the question text, result copy, and character artwork</td>
  </tr>
  <tr>
    <td><a href="https://github.com/serenakeyitan/sbti-wiki"><strong>sbti-wiki</strong></a></td>
    <td><a href="https://github.com/serenakeyitan">@serenakeyitan</a></td>
    <td>The visual README format here was inspired by that project's centered hero, badges, image strip, and information-card layout</td>
  </tr>
  <tr>
    <td><strong>sbti-cli</strong></td>
    <td><a href="https://github.com/bingran-you">Bingran You (@bingran-you)</a></td>
    <td>Built the sandboxed runtime loader, offline snapshot, image exporter, and regression test suite for a practical terminal workflow</td>
  </tr>
</table>

> ⚠️ **For entertainment only**: the upstream site already warns against treating this as diagnosis, hiring criteria, relationship truth, fortune telling, or any serious judgment. This repo is a tooling and reference project, not a psychological assessment.

---

## 📄 License

The original code and documentation in this repository are released under the [MIT License](LICENSE).

Third-party survey prompts, result text, and extracted character artwork originate from the upstream SBTI website and remain subject to their original ownership. See [NOTICE](NOTICE) for attribution and scope.

---

<a id="简体中文"></a>

## 简体中文

快速切换：[Jump to English](#english)

### 📖 目录

- [这是什么](#-这是什么)
- [如何安装与设置](#-如何安装与设置)
- [如何使用 CLI](#-如何使用-cli)
- [核心能力一览](#-核心能力一览)
- [结果图与离线资源](#-结果图与离线资源)
- [数据来源与原理](#-数据来源与原理)
- [鸣谢](#-鸣谢)
- [License](#-license-1)

---

## 🎯 这是什么

本仓库把 [**sbti.fancc.de5.net**](https://sbti.fancc.de5.net) 的 SBTI 人格测试做成了一个可在本地终端运行的 CLI。它不是手写一套“像官网”的逻辑，而是尽量复用官网自己的 `main.js` 运行时，因此保留了这些关键特性：

- 🎲 **和官网一致的题目行为**：30 道常规题随机顺序、饮酒分支插入位置、隐藏题触发规则都保持一致
- 📊 **和官网一致的结果计算**：15 维打分、H / M / L 分档、25 个标准人格匹配、`DRUNK` 覆盖、`HHHH` 兜底都保持一致
- 📴 **官网挂了也能跑**：默认优先拉取线上 `main.js`，失败后会自动切换到仓库内置的离线快照
- 🖼️ **结果图可本地导出**：27 张官网内嵌结果海报都能从 `main.js` 解码导出成独立图片
- ✅ **有对齐测试兜底**：除了基础单测，还包含官网运行时对齐测试和 50 组结果回归测试

如果你想：

- 在终端里完整做一次 SBTI
- 用脚本研究结果逻辑
- 在官网不可用时继续跑测试
- 把 27 张官方结果图批量导出来

这个仓库就是干这个的。

---

## 🧭 如何安装与设置

第一次使用时，按下面 4 步就够了：

| 步骤 | 做什么 |
|---|---|
| **1️⃣ 准备环境** | 安装 **Node.js 18+**，确保本机可以运行 `node` 和 `npm` |
| **2️⃣ 拉取仓库** | `git clone` 当前仓库，然后进入目录 |
| **3️⃣ 初始化项目** | 运行 `npm install` |
| **4️⃣ 验证环境** | 运行 `npm test`，确认本地 CLI 与离线/在线逻辑都正常 |

```bash
git clone https://github.com/bingran-you/sbti-cli.git
cd sbti-cli
npm install
npm test
```

安装完成后，直接启动：

```bash
npm run sbti
```

或者：

```bash
node src/cli.mjs
```

> 💡 这个项目没有额外的构建步骤，也不需要数据库、浏览器驱动或 `.env` 配置；有 Node.js 就能跑。

---

## 🧪 如何使用 CLI

### 常用命令

| 命令 | 作用 |
|---|---|
| `npm run sbti` | 正常开始一次测试 |
| `npm run sbti -- --seed 42` | 固定随机种子，方便复现题目顺序 |
| `npm run sbti -- --json` | 直接输出 JSON 结果 |
| `npm run sbti -- --preview-dimensions` | 答题时显示题目所属维度 |
| `npm run sbti -- --source-file ./main.js` | 从本地 `main.js` 加载题库和结果逻辑 |
| `npm run sbti -- --source-url https://.../main.js` | 指向自定义线上脚本 |
| `npm run export-images` | 导出 27 张结果图和本地画廊 |
| `npm run refresh-snapshot` | 用当前线上 `main.js` 刷新仓库内置离线快照 |

### 交互方式

运行测试后，CLI 会逐题提问。输入方式和导航规则如下：

| 输入 | 作用 |
|---|---|
| `A / B / C / D` | 选择当前题的选项 |
| `b` | 返回上一题修改答案 |
| `回车` | 如果当前题已有答案，则保留并进入下一题 |
| `q` | 中途退出，不提交结果 |
| `题号` | 全部答完后，跳回指定题号重新修改 |

### 一个最常见的流程

```bash
npm run sbti
```

```text
SBTI 人格测试 CLI
题库来源: https://sbti.fancc.de5.net/main.js

第 1 题 / 31 · 维度已隐藏
...

输入 A/B/C/D 选择，或输入 b 返回上一题。
> C
```

如果线上题库加载失败，CLI 会自动切到内置离线快照，并在开头明确提示你现在不是跑的线上版本。

---

## 🧬 核心能力一览

<table>
<tr>
  <th>模块</th>
  <th>能力</th>
  <th>说明</th>
</tr>
<tr>
  <td><strong>🎯 官网运行时</strong></td>
  <td>优先直接加载线上 <code>main.js</code></td>
  <td>题目顺序、饮酒隐藏题、打分、匹配、特殊分支都走官网同一套逻辑</td>
</tr>
<tr>
  <td><strong>🛟 离线回退</strong></td>
  <td>内置题库快照自动接管</td>
  <td>官网超时、挂掉或脚本异常时，CLI 仍然可用，不会整个失效</td>
</tr>
<tr>
  <td><strong>🖼️ 结果图资源</strong></td>
  <td>27 张内嵌海报可导出</td>
  <td>支持生成 <code>manifest.json</code> 与本地 <code>index.html</code> 画廊</td>
</tr>
<tr>
  <td><strong>🧪 回归测试</strong></td>
  <td>在线 + 离线双路径验证</td>
  <td>包含官网对齐测试、50 组结果回归、图片提取测试、离线兜底测试</td>
</tr>
<tr>
  <td><strong>🧰 开发接口</strong></td>
  <td>运行时对象可直接导入</td>
  <td>脚本可复用 <code>loadSbtiRuntime()</code>、<code>buildResultSummary()</code>、图片导出工具等能力</td>
</tr>
</table>

---

## 🎭 结果图与离线资源

<table>
  <tr>
    <td align="center" width="33%">
      <a href="assets/type-images/index.html"><img src="assets/type-images/CTRL.png" width="180"><br><strong>本地结果图画廊</strong></a><br>
      <sub>27 张海报导出后的可浏览 HTML 页面</sub>
    </td>
    <td align="center" width="33%">
      <a href="assets/type-images/manifest.json"><img src="assets/type-images/BOSS.png" width="180"><br><strong>结果图清单</strong></a><br>
      <sub>文件名、类型、字节数都收录在 manifest 里</sub>
    </td>
    <td align="center" width="33%">
      <a href="src/bundled-data.mjs"><img src="assets/type-images/SEXY.png" width="180"><br><strong>离线快照</strong></a><br>
      <sub>官网不可用时自动接管的内置题库与结果数据</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="scripts/export-type-images.mjs"><img src="assets/type-images/MALO.png" width="180"><br><strong>图片导出脚本</strong></a><br>
      <sub>把 <code>TYPE_IMAGES</code> 从 <code>main.js</code> 解码成独立图片</sub>
    </td>
    <td align="center">
      <a href="scripts/update-bundled-data.mjs"><img src="assets/type-images/DRUNK.png" width="180"><br><strong>快照刷新脚本</strong></a><br>
      <sub>在线时一键刷新仓库内置的离线数据</sub>
    </td>
    <td align="center">
      <a href="test/runtime.test.mjs"><img src="assets/type-images/HHHH.png" width="180"><br><strong>对齐测试</strong></a><br>
      <sub>确保 CLI 的结果分支和官网保持一致</sub>
    </td>
  </tr>
</table>

### 导出结果图

```bash
npm run export-images
```

执行后会生成：

- [`assets/type-images/index.html`](assets/type-images/index.html) — 本地画廊
- [`assets/type-images/manifest.json`](assets/type-images/manifest.json) — 27 张图片的清单
- [`assets/type-images/`](assets/type-images/) — 全部解码后的 `.png` / `.jpg` 文件

### 刷新离线快照

```bash
npm run refresh-snapshot
```

这个命令会重新抓取线上 `main.js`，然后覆盖 [`src/bundled-data.mjs`](src/bundled-data.mjs)，让离线模式尽量跟上官网的最新版本。

---

## 🔬 数据来源与原理

### 为什么能做到和官网行为一致

官网的测试逻辑全部打包在 `main.js` 里。本仓库的 [`src/runtime.mjs`](src/runtime.mjs) 使用 Node.js 的 `vm` 模块把这段脚本放进一个很小的 sandbox 里运行，再把内部常量和核心函数挂到运行时导出对象上复用。

CLI 不是手写“差不多”的逻辑，而是优先直接跑官网自己的：

| 运行时对象 | 内容 |
|---|---|
| `dimensionMeta` | 15 个维度的中文名与模型分组 |
| `questions` | 30 道常规题 |
| `specialQuestions` | 饮酒隐藏题与其前置分支 |
| `TYPE_LIBRARY` | 27 个人格的代号、中文名、开场白、完整描述 |
| `NORMAL_TYPES` | 25 个标准人格的 H / M / L 模板 |
| `DIM_EXPLANATIONS` | 15 维 × 3 档的维度文案 |
| `computeResult()` | 官网自己的结果分支逻辑 |

因此，CLI 可以和官网保持同一套：

- 题目 shuffle
- 饮酒题插入与隐藏题显示
- 15 维打分与分档
- 25 个标准人格匹配排序
- `DRUNK` 特殊覆盖
- `HHHH` 低匹配度兜底

### 结果图从哪里来

官网 `main.js` 里还内嵌了一个 `TYPE_IMAGES` 对象，27 张人物海报直接以 `data:image/png;base64,...` / `data:image/jpeg;base64,...` 的形式打包在脚本中。[`src/type-images.mjs`](src/type-images.mjs) 负责把它们解析出来，[`scripts/export-type-images.mjs`](scripts/export-type-images.mjs) 负责写成独立文件和本地画廊。

### 本仓库里最关键的文件

- [`src/cli.mjs`](src/cli.mjs) — 命令行交互入口
- [`src/runtime.mjs`](src/runtime.mjs) — 官网脚本加载、sandbox 运行、离线快照回退、结果汇总
- [`src/bundled-data.mjs`](src/bundled-data.mjs) — 官网不可用时使用的内置快照
- [`src/type-images.mjs`](src/type-images.mjs) — `TYPE_IMAGES` 解析与图片工具
- [`scripts/export-type-images.mjs`](scripts/export-type-images.mjs) — 导出 27 张结果图与画廊
- [`scripts/update-bundled-data.mjs`](scripts/update-bundled-data.mjs) — 刷新离线快照
- [`test/runtime.test.mjs`](test/runtime.test.mjs) — 官网结果对齐与离线兜底测试
- [`test/type-images.test.mjs`](test/type-images.test.mjs) — 图片提取与完整性测试

---

## 🙏 鸣谢

<table>
  <tr>
    <th>项目</th>
    <th>作者</th>
    <th>贡献</th>
  </tr>
  <tr>
    <td><a href="https://sbti.fancc.de5.net"><strong>SBTI 人格测试</strong></a></td>
    <td>B 站 <a href="https://space.bilibili.com/417038183">@蛆肉儿串儿</a></td>
    <td>原测试作者，提供题目、27 个人格文案与角色插画</td>
  </tr>
  <tr>
    <td><a href="https://github.com/serenakeyitan/sbti-wiki"><strong>sbti-wiki</strong></a></td>
    <td><a href="https://github.com/serenakeyitan">@serenakeyitan</a></td>
    <td>这次 README 改版的版式参考来源：中心 Hero、徽章、图卡与信息分段方式</td>
  </tr>
  <tr>
    <td><strong>sbti-cli</strong></td>
    <td><a href="https://github.com/bingran-you">Bingran You (@bingran-you)</a></td>
    <td>把官网 <code>main.js</code> sandbox 化，补上离线快照、结果图导出与测试体系，提供一个可直接使用的 CLI</td>
  </tr>
</table>

> ⚠️ **仅供娱乐**：原测试首页已经写得很明确了，不要把它当成诊断、面试、相亲、分手、招魂、算命或人生判决书。本仓库也只是一个便于运行、研究和导出资源的工具。

---

## 📄 License

本仓库中由本项目原创的代码与文档采用 [MIT License](LICENSE) 发布。

与此同时，来自上游 SBTI 网站的题目文案、结果文案以及角色插画仍然归原作者所有，并不因为放进这个仓库就自动转成 MIT。具体归属说明见 [NOTICE](NOTICE)。
