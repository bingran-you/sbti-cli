<h1 align="center">SBTI CLI · 官网逻辑等效的命令行版</h1>

<p align="center">
  <em>把 SBTI 人格测试搬进终端，同时尽量保留官网同一套运行时与结果资源。</em><br>
  一个支持 <strong>纯离线运行</strong>、<strong>内置题库快照</strong>、<strong>结果图导出</strong> 的 Node.js CLI。
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

- [这是什么](#-这是什么)
- [如何安装与设置](#-如何安装与设置)
- [如何使用 CLI](#-如何使用-cli)
- [核心能力一览](#-核心能力一览)
- [结果图与离线资源](#-结果图与离线资源)
- [数据来源与原理](#-数据来源与原理)
- [鸣谢](#-鸣谢)
- [License](#-license)

---

## 🎯 这是什么

本仓库把 [**sbti.fancc.de5.net**](https://sbti.fancc.de5.net) 的 SBTI 人格测试做成了一个可在本地终端运行的 CLI。它不是手写一套“像官网”的逻辑，而是把题库和结果逻辑打包成内置快照，在本地 sandbox 中运行，因此保留了这些关键特性：

- 🎲 **和官网一致的题目行为**：30 道常规题随机顺序、饮酒分支插入位置、隐藏题触发规则都保持一致
- 📊 **和官网一致的结果计算**：15 维打分、H / M / L 分档、25 个标准人格匹配、`DRUNK` 覆盖、`HHHH` 兜底都保持一致
- 📴 **每次都纯离线运行**：CLI 每次都直接使用仓库内置快照，不依赖 live website
- 🖼️ **结果图可本地整理**：27 张结果海报已随仓库提供，可重建本地 manifest 与画廊
- ✅ **有对齐测试兜底**：除了基础单测，还包含 50 组结果回归测试与离线资源完整性验证

如果你想：

- 在终端里完整做一次 SBTI
- 用脚本研究结果逻辑
- 在完全离线的环境里继续跑测试
- 重建 27 张结果图的本地资源清单

这个仓库就是干这个的。

---

## 🧭 如何安装与设置

第一次使用时，按下面 4 步就够了：

| 步骤 | 做什么 |
|---|---|
| **1️⃣ 准备环境** | 安装 **Node.js 18+**，确保本机可以运行 `node` 和 `npm` |
| **2️⃣ 拉取仓库** | `git clone` 当前仓库，然后进入目录 |
| **3️⃣ 初始化项目** | 运行 `npm install` |
| **4️⃣ 验证环境** | 运行 `npm test`，确认本地 CLI 与内置离线运行时都正常 |

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
| `npm run export-images` | 基于仓库内已有图片重建 manifest 和本地画廊 |

### 交互方式

运行测试后，CLI 会逐题提问。输入方式和导航规则如下：
每个答案一旦提交，就会在本轮测试中锁定。

| 输入 | 作用 |
|---|---|
| `A / B / C / D` | 选择当前题的选项 |
| `q` | 中途退出，不提交结果 |

### 一个最常见的流程

```bash
npm run sbti
```

```text
SBTI 人格测试 CLI
题库来源: bundled:sbti-main.js

第 1 题 / 31 · 维度已隐藏
...

输入 A/B/C/D 选择，或输入 q 退出。
> C
```

## 🧬 核心能力一览

<table>
<tr>
  <th>模块</th>
  <th>能力</th>
  <th>说明</th>
</tr>
<tr>
  <td><strong>🛟 离线运行时</strong></td>
  <td>始终直接加载内置快照</td>
  <td>题目顺序、饮酒隐藏题、打分、匹配、特殊分支都走本地内置的同一套逻辑</td>
</tr>
<tr>
  <td><strong>🖼️ 结果图资源</strong></td>
  <td>27 张已收录海报可本地整理</td>
  <td>支持生成 <code>manifest.json</code> 与本地 <code>index.html</code> 画廊</td>
</tr>
<tr>
  <td><strong>🧪 回归测试</strong></td>
  <td>内置运行时验证</td>
  <td>包含 50 组结果回归、图片完整性测试与离线运行路径验证</td>
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
      <sub>每次 CLI 运行都会直接使用的内置题库与结果数据</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="scripts/export-type-images.mjs"><img src="assets/type-images/MALO.png" width="180"><br><strong>图片导出脚本</strong></a><br>
      <sub>基于仓库内已有图片重建 manifest 和本地画廊</sub>
    </td>
    <td align="center">
      <a href="test/runtime.test.mjs"><img src="assets/type-images/HHHH.png" width="180"><br><strong>对齐测试</strong></a><br>
      <sub>确保 CLI 的结果分支和内置逻辑保持一致</sub>
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

## 🔬 数据来源与原理

### 为什么能做到和官网行为一致

本仓库把题库和结果逻辑存成 [`src/bundled-data.mjs`](src/bundled-data.mjs) 里的内置快照，再通过 [`src/runtime.mjs`](src/runtime.mjs) 用 Node.js 的 `vm` 模块放进一个很小的 sandbox 里运行。

CLI 不是手写“差不多”的逻辑，而是每次都直接跑这份内置快照里的同一套对象：

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

27 张人物海报已经随仓库一起存放在 [`assets/type-images/`](assets/type-images/) 中。[`scripts/export-type-images.mjs`](scripts/export-type-images.mjs) 负责根据这些本地文件重建 manifest 和本地画廊。

### 本仓库里最关键的文件

- [`src/cli.mjs`](src/cli.mjs) — 命令行交互入口
- [`src/runtime.mjs`](src/runtime.mjs) — 内置运行时加载、sandbox 运行、结果汇总
- [`src/bundled-data.mjs`](src/bundled-data.mjs) — CLI 使用的内置快照
- [`src/type-images.mjs`](src/type-images.mjs) — 图片工具与本地画廊生成
- [`scripts/export-type-images.mjs`](scripts/export-type-images.mjs) — 重建结果图 manifest 与画廊
- [`test/runtime.test.mjs`](test/runtime.test.mjs) — 内置运行时对齐测试
- [`test/type-images.test.mjs`](test/type-images.test.mjs) — 图片资源完整性测试

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
    <td>把题库快照 sandbox 化，补上离线运行、结果图整理与测试体系，提供一个可直接使用的 CLI</td>
  </tr>
</table>

> ⚠️ **仅供娱乐**：原测试首页已经写得很明确了，不要把它当成诊断、面试、相亲、分手、招魂、算命或人生判决书。本仓库也只是一个便于运行、研究和导出资源的工具。

---

## 📄 License

本仓库中由本项目原创的代码与文档采用 [MIT License](LICENSE) 发布。

与此同时，来自上游 SBTI 网站的题目文案、结果文案以及角色插画仍然归原作者所有，并不因为放进这个仓库就自动转成 MIT。具体归属说明见 [NOTICE](NOTICE)。
