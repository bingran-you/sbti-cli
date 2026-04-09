<h1 align="center">SBTI CLI · 官网逻辑等效的命令行版</h1>

<p align="center">
  <em>把 SBTI 人格测试搬进终端，同时尽量保留官网同一套运行时与结果资源。</em><br>
  一个支持 <strong>在线同步</strong>、<strong>离线回退</strong>、<strong>结果图导出</strong> 的 Node.js CLI。
</p>

<p align="center">
  <a href="https://sbti.fancc.de5.net"><img alt="原测试" src="https://img.shields.io/badge/原测试-sbti.fancc.de5.net-4CAF50?style=flat-square"></a>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square">
  <img alt="运行模式" src="https://img.shields.io/badge/运行模式-在线%20%2B%20离线-blue?style=flat-square">
  <img alt="结果图" src="https://img.shields.io/badge/结果图-27%20张-orange?style=flat-square">
  <img alt="题目" src="https://img.shields.io/badge/题目-30%20%2B%201%20隐藏-purple?style=flat-square">
  <img alt="语言" src="https://img.shields.io/badge/语言-简体中文-red?style=flat-square">
</p>

<p align="center">
  <img src="assets/type-images/CTRL.png"  width="130" alt="CTRL">
  <img src="assets/type-images/BOSS.png"  width="130" alt="BOSS">
  <img src="assets/type-images/SEXY.png"  width="130" alt="SEXY">
  <img src="assets/type-images/MALO.png"  width="130" alt="MALO">
  <img src="assets/type-images/DRUNK.png" width="130" alt="DRUNK">
  <img src="assets/type-images/HHHH.png"  width="130" alt="HHHH">
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

当前仓库还没有单独附带一个正式的 `LICENSE` 文件；代码与文档请先按学习、研究、娱乐用途理解。与此同时，原测试中的题目文案、结果文案和角色插画仍然归原作者所有，请不要把这些内容拿去做商业用途。
