<h1 align="center">SBTI CLI - 给你的智能体测一测 SBTI。</h1>

<p align="center">
  <em>SBTI CLI - 给你的智能体测一测 SBTI。</em><br>
  一个支持 <strong>纯离线执行</strong>、<strong>内置问卷数据</strong>、<strong>结果图导出</strong> 的 Node.js CLI。
</p>

<p align="center">
  <a href="https://sbti.fancc.de5.net"><img alt="原测试" src="https://img.shields.io/badge/原测试-sbti.fancc.de5.net-4CAF50?style=flat-square"></a>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square">
  <img alt="运行模式" src="https://img.shields.io/badge/运行模式-纯离线-blue?style=flat-square">
  <img alt="结果图" src="https://img.shields.io/badge/结果图-27%20张-orange?style=flat-square">
  <img alt="题目" src="https://img.shields.io/badge/题目-30%20%2B%201%20隐藏-purple?style=flat-square">
  <img alt="许可证" src="https://img.shields.io/badge/许可证-MIT-red?style=flat-square">
</p>

<p align="center">
  <a href="./README.md"><img alt="English" src="https://img.shields.io/badge/English-click_to_switch-2563EB?style=for-the-badge"></a>
  <a href="./README.zh-CN.md"><img alt="简体中文" src="https://img.shields.io/badge/简体中文-当前-F0522D?style=for-the-badge"></a>
</p>

<p align="center">
  <img src="assets/type-images/CTRL.png" width="130" alt="CTRL">
  <img src="assets/type-images/BOSS.png" width="130" alt="BOSS">
  <img src="assets/type-images/SEXY.png" width="130" alt="SEXY">
  <img src="assets/type-images/MALO.png" width="130" alt="MALO">
  <img src="assets/type-images/DRUNK.png" width="130" alt="DRUNK">
  <img src="assets/type-images/HHHH.png" width="130" alt="HHHH">
</p>

---

## 📖 目录

- [📖 目录](#-目录)
- [🎯 这是什么](#-这是什么)
- [🧭 安装与设置](#-安装与设置)
- [🧪 使用 CLI](#-使用-cli)
  - [常用命令](#常用命令)
  - [交互控制](#交互控制)
  - [典型运行](#典型运行)
- [🧬 核心能力](#-核心能力)
- [🎭 结果图与离线资源](#-结果图与离线资源)
  - [导出全部结果图](#导出全部结果图)
- [🔬 数据来源与原理](#-数据来源与原理)
  - [为什么它能和网站高度一致](#为什么它能和网站高度一致)
  - [海报素材来自哪里](#海报素材来自哪里)
  - [仓库里的关键文件](#仓库里的关键文件)
- [🙏 鸣谢](#-鸣谢)
- [📄 许可证](#-许可证)

---

## 🎯 这是什么

这个仓库把 **SBTI** 变成了一个可以在本地运行的命令行工具。

核心特性：

- 🎲 **与网站等效的题目流程**
- 📊 **与网站等效的评分逻辑**
- 📴 **可安全离线运行**
- 🖼️ **可导出的结果海报**
- ✅ **回归测试覆盖**

---

## 🧭 安装与设置

上手只需要四步：

| 步骤 | 要做什么 |
|---|---|
| **1️⃣ 安装 Node.js** | 使用 **Node.js 18+**，确保系统里有 `node` 和 `npm` |
| **2️⃣ 克隆仓库** | 将这个仓库下载到本地 |
| **3️⃣ 安装依赖** | 运行 `npm install` |
| **4️⃣ 验证环境** | 运行 `npm test`，确认内置离线运行时工作正常 |

```bash
git clone https://github.com/bingran-you/sbti-cli.git
cd sbti-cli
npm install
npm test
```

发布到 npm 的 tarball 只包含独立的 `dist/sbti-cli.mjs` bundle 和包元数据。开发源码、测试、脚本以及图片资源仍保留在仓库中。

完成安装后，可以这样启动 CLI：

```bash
npm run sbti
```

或者：

```bash
node src/cli.mjs
```

> 💡 这个项目不需要构建步骤、数据库、浏览器驱动或 `.env` 文件。只要装好了 Node.js，就可以直接运行。

---

## 🧪 使用 CLI

### 常用命令

| 命令 | 用途 |
|---|---|
| `npm run sbti` | 启动一次标准的交互式测试 |
| `npm run sbti -- --seed 42` | 使用固定随机种子 |
| `npm run sbti -- --json` | 以 JSON 输出最终结果 |
| `npm run export-images` | 基于内置资源重建本地海报清单和画廊 |

### 交互控制

CLI 启动后，会一次只显示一道题：
每个答案一旦提交，就会在该次测试中锁定。

| 输入 | 动作 |
|---|---|
| `A / B / C / D` | 选择当前选项 |
| `q` | 不提交结果并退出 |

### 典型运行

```bash
npm run sbti
```

```text
SBTI 人格测试 CLI

第 1 题 / 31 · 维度已隐藏
...

输入 A/B/C/D 选择，或输入 q 退出。
> C
```

---

## 🧬 核心能力

<table>
<tr>
  <th>领域</th>
  <th>能力</th>
  <th>说明</th>
</tr>
<tr>
  <td><strong>🛟 离线运行时</strong></td>
  <td>始终从内置快照运行</td>
  <td>CLI 在运行时不会去抓取线上网站，因此每次问卷执行都完全保留在本地</td>
</tr>
<tr>
  <td><strong>🖼️ 结果图导出</strong></td>
  <td>27 张内置海报可在本地建立索引</td>
  <td>仓库可以根据已提交的图片文件重建 JSON manifest 和 HTML 画廊</td>
</tr>
<tr>
  <td><strong>🧪 回归测试</strong></td>
  <td>验证内置运行时</td>
  <td>包含运行时一致性、50 组确定性结果样例，以及离线资源覆盖检查</td>
</tr>
<tr>
  <td><strong>🧰 可脚本化的运行时 API</strong></td>
  <td>可导入的工具函数</td>
  <td>你可以在自定义脚本中复用 <code>loadSbtiRuntime()</code>、<code>buildResultSummary()</code> 和图片辅助函数</td>
</tr>
</table>

---

## 🎭 结果图与离线资源

<table>
  <tr>
    <td align="center" width="33%">
      <a href="assets/type-images/index.html"><img src="assets/type-images/CTRL.png" width="180"><br><strong>本地结果画廊</strong></a><br>
      <sub>由提取出的海报文件生成的 HTML 画廊</sub>
    </td>
    <td align="center" width="33%">
      <a href="assets/type-images/manifest.json"><img src="assets/type-images/BOSS.png" width="180"><br><strong>图片清单</strong></a><br>
      <sub>记录所有导出海报的文件名、MIME 类型与大小</sub>
    </td>
    <td align="center" width="33%">
      <a href="src/bundled-data.mjs"><img src="assets/type-images/SEXY.png" width="180"><br><strong>离线快照</strong></a><br>
      <sub>每次 CLI 运行都会使用的内置问卷数据</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="scripts/export-type-images.mjs"><img src="assets/type-images/MALO.png" width="180"><br><strong>图片导出脚本</strong></a><br>
      <sub>根据已提交的图片文件重建本地海报清单和画廊</sub>
    </td>
    <td align="center">
      <a href="test/runtime.test.mjs"><img src="assets/type-images/HHHH.png" width="180"><br><strong>一致性测试</strong></a><br>
      <sub>检查 CLI 结果是否持续与内置评分逻辑保持一致</sub>
    </td>
  </tr>
</table>

### 导出全部结果图

```bash
npm run export-images
```

这会生成：

- [`assets/type-images/index.html`](assets/type-images/index.html) — 本地画廊
- [`assets/type-images/manifest.json`](assets/type-images/manifest.json) — 海报清单
- [`assets/type-images/`](assets/type-images/) — 全部解码后的 `.png` / `.jpg` 文件

## 🔬 数据来源与原理

### 为什么它能和网站高度一致

这个仓库把问卷数据和评分逻辑作为内置快照存放在 [`src/bundled-data.mjs`](src/bundled-data.mjs) 中。[`src/runtime.mjs`](src/runtime.mjs) 再把这份快照转成一个沙箱运行时，让 CLI 在保持本地执行的同时，尽量保留原始题目流程和结果计算方式。

因此，CLI 在每次运行中都会使用同一批运行时对象：

| 运行时对象 | 内容 |
|---|---|
| `dimensionMeta` | 15 个维度的中文标签和模型分组 |
| `questions` | 30 道常规题 |
| `specialQuestions` | 饮酒分支题组 |
| `TYPE_LIBRARY` | 27 种结果类型的代号、名称、开场白与完整描述 |
| `NORMAL_TYPES` | 25 个常规人格的 H / M / L 模板 |
| `DIM_EXPLANATIONS` | 每个 L / M / H 档位的维度解释 |
| `computeResult()` | 网站原始的结果选择分支逻辑 |

这也是 CLI 能持续对齐这些行为的原因：

- 题目乱序
- 饮酒分支插入与隐藏题显示
- 15 维评分与分档
- 常规人格排序
- `DRUNK` 覆盖
- `HHHH` 低相似度兜底

### 海报素材来自哪里

全部 27 张结果海报都已经收录在 [`assets/type-images/`](assets/type-images/) 中。[`scripts/export-type-images.mjs`](scripts/export-type-images.mjs) 会根据这些本地文件重建 manifest 和画廊页面。

### 仓库里的关键文件

- [`src/cli.mjs`](src/cli.mjs) — CLI 入口与交互式问卷流程
- [`src/runtime.mjs`](src/runtime.mjs) — 内置运行时加载、沙箱求值与结果汇总
- [`src/bundled-data.mjs`](src/bundled-data.mjs) — 内置离线快照
- [`src/type-images.mjs`](src/type-images.mjs) — 图片辅助函数与本地画廊生成
- [`dist/sbti-cli.mjs`](dist/sbti-cli.mjs) — npm 包中发布的独立 CLI bundle
- [`scripts/build-dist.mjs`](scripts/build-dist.mjs) — 生成可发布独立 CLI bundle 的脚本
- [`scripts/export-type-images.mjs`](scripts/export-type-images.mjs) — 本地海报元数据重建脚本
- [`test/runtime.test.mjs`](test/runtime.test.mjs) — 内置运行时一致性测试
- [`test/package.test.mjs`](test/package.test.mjs) — 发布 tarball 表面检查
- [`test/type-images.test.mjs`](test/type-images.test.mjs) — 离线资源覆盖检查

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
    <td>Bilibili <a href="https://space.bilibili.com/417038183">@蛆肉儿串儿</a></td>
    <td>原始问卷作者，也是题目文案、结果文案和角色插画的来源</td>
  </tr>
  <tr>
    <td><a href="https://github.com/serenakeyitan/sbti-wiki"><strong>sbti-wiki</strong></a></td>
    <td><a href="https://github.com/serenakeyitan">@serenakeyitan</a></td>
    <td>这里的 README 视觉排版参考了该项目的居中 Hero、徽章、图片横列和信息卡片式布局</td>
  </tr>
  <tr>
    <td><strong>sbti-cli</strong></td>
    <td><a href="https://github.com/bingran-you">Bingran You (@bingran-you)</a></td>
    <td>构建了沙箱运行时加载器、离线快照、图片导出工具，以及适合终端工作流的回归测试套件</td>
  </tr>
</table>

> ⚠️ **仅供娱乐**：上游网站已经提醒，不要把它当成诊断、招聘标准、关系真相、算命或任何严肃判断依据。本仓库是一个工具与参考项目，不是心理测评。

---

## 📄 许可证

本仓库中的原创代码与文档采用 [MIT License](LICENSE) 发布。

第三方题目文案、结果文本以及提取出的角色插画均来自上游 SBTI 网站，仍受其原始权利归属约束。归属与范围说明见 [NOTICE](NOTICE)。
