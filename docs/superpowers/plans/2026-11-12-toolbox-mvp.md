# Toolbox MVP 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 subagent-driven-development（推荐）或 executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 从零搭建 Toolbox：纯前端 Web 工具集合（时间戳 / UUID / JSON / Base64 / URL 五个工具），Vite + React 18 + TypeScript + Tailwind，Cloudflare Pages 静态托管，全部数据不出浏览器。

**架构：** 每个工具拆为「纯函数 + 组件」：转换/校验/编解码逻辑放 `src/tools/<name>/utils.ts`（可被 Vitest 直接 import），组件只做 UI 编排。全局通用组件（`ToolLayout` 等）统一工具页骨架。主题用 Tailwind `dark:` 类 + FOUC 内联脚本。

**技术栈：** Vite、React 18、TypeScript、react-router-dom（BrowserRouter）、Tailwind CSS、Vitest；Node 20+。

**规格：** `docs/个人Web工具箱（Toolbox）_PRD.md`（需求与数值唯一来源）；`.claude/rules/01-04`（实现层不变量）。

## 全局约束

- 无后端、无 API 调用、无 SSR；运行时数据只存 `localStorage`（key 一律带 `toolbox.` 前缀）；不引入时区数据库。
- 历史记录结构为数组：时间戳/UUID/Base64/URL 各最近 10 条；JSON 最近 5 条、单条 >100KB 不写入并提示「超出历史上限」；超限丢弃最旧条目。
- 写入 URL 参数前判长度（Base64/URL 工具输入 ≤2000 字符，超限只存历史不写 URL）；读取 URL 参数必须校验，非法回退默认值并给非阻塞提示。
- 主题：Tailwind `dark:` 类（`darkMode: 'class'`，挂 `document.documentElement`）；首次访问跟随系统 `prefers-color-scheme`，手动切换写 `localStorage`；FOUC 内联脚本在主 bundle 前执行。
- 工具页骨架统一 `ToolLayout`；移动端可点区域 ≥44px；断点只用 Tailwind 默认 sm/md/lg。
- 每个路由挂载时设置 `document.title` 和 meta description。
- Vitest 只测纯函数；每个业务实现必须有对应测试且覆盖非 happy path；提交前 `npm run build` + `npx vitest run` 全量通过。
- 构建输出含 `_redirects`（`/* /index.html 200`）；全部资源随构建产物本地化，不用 CDN 字体。

## 审查重点（Review Focus）

1. **Base64 解码含 UTF-8 中文字节**：中文输入编码后解码必须还原原文（多字节字符不损坏、无乱码）——测试：`Base64 → 测试`。
2. **Base64 URL-safe 模式**：`-`/`_` 替代 `+`/`/`、必要时去 padding，解码端兼容两种字母表——测试：`Base64 → 测试`。
3. **URL `decodeURIComponent` 输入含非法 `%` 序列**（如 `%zz`、孤立 `%E4`）：捕获异常显示明确错误，不崩溃、不静默返回原值——测试：`URL → 测试`。
4. **JSON 非法输入**：错误定位到行号+列号；空输入给明确提示；超大输入不卡死——测试：`JSON → 测试`。
5. **时间戳非法输入**：空串、非数字、超大数字、非法日期串均显示明确错误；URL `ts` 参数非法时回退默认并 toast——测试：`时间戳 → 测试`。

---

### 任务 1：项目脚手架与全局布局

**文件：**
- 创建：`package.json`、`vite.config.ts`、`tsconfig.json`、`tailwind.config.js`、`postcss.config.js`
- 创建：`index.html`、`src/main.tsx`、`src/App.tsx`、`src/index.css`、`src/vite-env.d.ts`
- 创建：`src/lib/useSeo.ts`（路由 title + meta description 的轻量 hook）
- 创建：`src/components/ThemeToggle.tsx`、`src/components/NavBar.tsx`
- 创建：`src/pages/HomePage.tsx`、`src/pages/tools/*.tsx`（5 个工具页占位）
- 创建：`public/_redirects`（内容 `/* /index.html 200`）

- [ ] **步骤 1：初始化 Vite + React 18 + TS 项目**

`npm create vite@latest . --template react-ts`，安装 `react-router-dom`、`tailwindcss postcss autoprefixer`、`vitest`（dev）。`tailwind.config.js` 设 `darkMode: 'class'`、`content: ['./index.html', './src/**/*.{ts,tsx}']`。`index.html` 的 `<head>` 里加内联 FOUC 脚本：

```html
<script>
  (function () {
    var t;
    try { t = localStorage.getItem('toolbox.pref.theme'); } catch (e) {}
    var dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  })();
</script>
```

- [ ] **步骤 2：实现 `useSeo` hook 与路由结构**

`src/lib/useSeo.ts` 导出 `useSeo(title: string, description: string)`：`useEffect` 内设置 `document.title` 与 meta description（无则创建 `<meta name="description">`）。`src/App.tsx` 用 `BrowserRouter` + `Routes` 注册 6 条路由：`/` 与 PRD §2 的 5 个工具路径（`/tools/timestamp`、`/tools/uuid`、`/tools/json`、`/tools/base64`、`/tools/url`），工具页先占位（渲染 `ToolLayout` 空壳 + `useSeo` 各自文案）。`NavBar` 含站点名 + `ThemeToggle`。

- [ ] **步骤 3：实现 `ThemeToggle`**

`theme` 状态来源：`localStorage['toolbox.pref.theme']` 为 `'light'`/`'dark'` 时以之为准，否则跟随系统。点击切换：设置 `document.documentElement` 的 class 并写入 `localStorage`。验收：刷新主题保持；清除 localStorage 后恢复跟随系统。

- [ ] **步骤 4：首页卡片网格 + `public/_redirects`**

`HomePage` 用 `useSeo`，5 个工具卡片（标题+一句话说明）用 `Link` 到对应路由；窄屏单列（`grid-cols-1 sm:grid-cols-2`）。`public/_redirects` 一行 `/* /index.html 200`。

- [ ] **步骤 5：验证**

运行：`npm run build`（确认 `dist/_redirects` 存在）+ `npx tsc --noEmit`（或 build 内含的检查）预期：通过。
运行主题验收手动检查：刷新后主题保持；清 `localStorage` 后跟随系统。

- [ ] **步骤 6：Commit**

```bash
git add -A
git commit -m "feat: 项目脚手架、路由、全局布局与主题切换"
```

---

### 任务 2：通用组件 + localStorage 历史工具

**文件：**
- 创建：`src/components/ToolLayout.tsx`、`src/components/CopyButton.tsx`、`src/components/ErrorText.tsx`、`src/components/ExampleButton.tsx`、`src/components/HistoryPanel.tsx`
- 创建：`src/lib/history.ts`（带单工具上限配置的读写与清理逻辑，纯函数部分可测）
- 测试：`src/lib/history.test.ts`

- [ ] **步骤 1：编写失败的测试（history）**

`src/lib/history.test.ts` 覆盖（纯函数，无 DOM）：

```ts
// writeHistory(key, entries, {max, maxItemBytes}) 行为
// 1) 超条数上限：丢弃最旧条目（旧在下标 0），保留最近 max 条
// 2) JSON 工具单条 >100KB：该条不写入，返回 { skipped: true } 供 UI 提示「超出历史上限」
// 3) localStorage 无 key / JSON.parse 失败：readHistory 返回 []（不抛异常）
// 4) key 必须以 'toolbox.' 开头，传入裸 key 时函数 throw（防呆）
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run src/lib/history.test.ts` 预期：FAIL，`history` 未定义。

- [ ] **步骤 3：实现 `src/lib/history.ts`**

导出纯函数（localStorage 以参数注入，默认用全局 `window.localStorage`）：`readHistory<T>(key: string): T[]`、`writeHistory<T>(key: string, entries: T[], cfg: { max: number; maxItemBytes?: number }): { skipped?: boolean }`、`clearHistory(key: string): void`。`maxItemBytes` 按 `JSON.stringify(entry)` 字节数判断（用 `new TextEncoder().encode(str).length`）。key 校验：`!key.startsWith('toolbox.')` 时 throw。`ToolLayout` props 定义（骨架固定子区域：标题+说明、输入区、操作按钮区、输出区、错误区、示例、重置、复制、历史面板占位）；`CopyButton` 内部封装 `navigator.clipboard` + `document.execCommand('copy')` 降级 + 短暂成功反馈；`ErrorText` 渲染错误区；`ExampleButton`/`HistoryPanel`（含「清空历史」按钮，点击调 `clearHistory` 并给反馈）。所有可点元素 `min-h-[44px]` 保证触控区。

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run src/lib/history.test.ts` 预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/lib/history.ts src/lib/history.test.ts src/components/
git commit -m "feat: 通用组件与 localStorage 历史工具"
```

---

### 任务 3：时间戳转换

**文件：**
- 创建：`src/tools/timestamp/utils.ts`、`src/tools/timestamp/index.tsx`
- 测试：`src/tools/timestamp/utils.test.ts`

- [ ] **步骤 1：编写失败的测试**

`utils.test.ts` 覆盖：

```ts
// parseTimestamp(input: string, unit: 's' | 'ms'): number | { error: string }
// 1) 合法数字串（s 单位，如 "1700000000"）→ ms 数正确
// 2) 非数字 / 空串 → error
// 3) 超大数字（> 1e15）→ error 或 clamp 说明

// toLocalTimeStr(ms: number): string（本地时区，格式如 2023-11-14 08:00:00）
// toUtcTimeStr(ms: number): string
// toIsoStr(ms: number): string
// timestampToDateInput(ms: number): string（喂给 <input type="datetime-local"> 的本地值）

// dateToTimestamp(dateStr: string, unit: 's' | 'ms'): number
// 4) 合法 datetime-local 值 → 秒/毫秒正确
// 5) 空串 / 非法日期串 → error
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run src/tools/timestamp/utils.test.ts` 预期：FAIL。

- [ ] **步骤 3：实现 `utils.ts` + 组件**

组件：`ToolLayout` 承载；实时显示当前时间戳（每秒刷新，单位 `s`/`ms` 可切换）；双向转换模式（`toTime`/`toTs`）；读 URL 参数 `ts`/`unit`/`mode`（校验，非法回退默认 + toast）；写 URL 参数（`ts` 合法时更新 `searchParams`）。输出区：toTime 模式展示本地时间、UTC 时间、ISO 8601；toTs 模式展示秒级+毫秒级时间戳（时间输入用 `timestampToDateInput` 喂 `datetime-local`）。历史 key `toolbox.history.timestamp`，最近 10 条。

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run src/tools/timestamp/utils.test.ts` + 全量 `npx vitest run` 预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/tools/timestamp/
git commit -m "feat: 时间戳转换工具"
```

---

### 任务 4：UUID 生成

**文件：**
- 创建：`src/tools/uuid/utils.ts`、`src/tools/uuid/index.tsx`
- 测试：`src/tools/uuid/utils.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
// formatUuid(raw: string, opts: { upper?: boolean; noHyphen?: boolean; curly?: boolean }): string
// 1) 默认 lowercase with hyphens
// 2) upper / noHyphen / curly 各选项组合正确

// isValidUuid(v: string): boolean（宽松：大小写/带不带横线/花括号都认，v4 校验 version 位）

// clampCount(n: number): number（1~100 之外 clamp 到边界）

// randomUuid(crypto?: Crypto): string
// 3) crypto.randomUUID 可用时结果匹配 v4 正则
// 4) 注入的 crypto 无 randomUUID 时，降级路径（getRandomValues）构造的仍是合法 v4
// 5) version 位 = '4'，variant 位 ∈ {8,9,a,b}
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run src/tools/uuid/utils.test.ts` 预期：FAIL。

- [ ] **步骤 3：实现 `utils.ts` + 组件**

组件：数量输入（1~100，超限 clamp）、三个选项复选框（大写/去横线/加花括号）、生成按钮、输出列表（每条可复制 + 复制全部按钮）。历史 key `toolbox.history.uuid`，最近 10 条（整批记录）。不做 URL 参数。

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run src/tools/uuid/utils.test.ts` + 全量 预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/tools/uuid/
git commit -m "feat: UUID 生成工具"
```

---

### 任务 5：JSON 工具

**文件：**
- 创建：`src/tools/json/utils.ts`、`src/tools/json/index.tsx`
- 测试：`src/tools/json/utils.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
// validateJson(input: string): { ok: boolean; error?: { line: number; column: number; message: string } }
// 1) 合法 JSON → ok: true
// 2) 非法（缺逗号、尾逗号、裸字符串）→ ok: false，line/column 精确指向错误位置
// 3) 空串 → ok: false，message 明确「输入为空」

// parseJsonSafe(input: string): { ok: true; value: unknown } | { ok: false; error: { line, column, message } }
// 4) 基于 JSON.parse + 错误信息里的位置正则解析行/列；合法输入返回 value 供排序/格式化复用

// formatJson(input: string, indent: 2 | 4): string | { error }
// 5) 2 空格 / 4 空格缩进各自正确

// minifyJson(input: string): string | { error }
// 6) 移除所有非必要空白

// sortKeysDeep(value: unknown): unknown
// 7) 递归排序对象键（嵌套对象、键序、数组内对象也排序）

// 8) 超大输入（如 5MB 字符串）：validateJson 仍能定位错误，不抛异常
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run src/tools/json/utils.test.ts` 预期：FAIL。

- [ ] **步骤 3：实现 `utils.ts` + 组件**

组件：文本区输入、格式化/压缩/校验/按键名排序 按钮，缩进 2/4 可选。历史 key `toolbox.history.json`，最近 5 条、单条 >100KB 不写入并提示「超出历史上限」（用任务 2 的 `writeHistory` 返回值判断）。不做 URL 参数。

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run src/tools/json/utils.test.ts` + 全量 预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/tools/json/
git commit -m "feat: JSON 工具"
```

---

### 任务 6：Base64 编解码

**文件：**
- 创建：`src/tools/base64/utils.ts`、`src/tools/base64/index.tsx`
- 测试：`src/tools/base64/utils.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
// encodeBase64(text: string, urlSafe?: boolean): string
// 1) ASCII 正确
// 2) 中文（UTF-8）正确 —— 编码后解码必须还原原文（核心验收）
// 3) urlSafe: true → 输出无 '+' 和 '/'，必要时去 padding

// decodeBase64(input: string, urlSafe?: boolean): string | { error: string }
// 4) 普通 base64 解码正确
// 5) urlSafe 字母表（'-'/'_'）解码正确
// 6) 非法输入（含非 base64 字符、长度 %4 === 1）→ 明确 error，不返回乱码
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run src/tools/base64/utils.test.ts` 预期：FAIL。

- [ ] **步骤 3：实现 `utils.ts` + 组件**

实现用 `TextEncoder` → `btoa(String.fromCharCode(...bytes))`（或 chunk 版）/ `atob` + `TextDecoder`。组件：编码/解码双向、URL-safe 开关、输入/输出区、错误区。历史 key `toolbox.history.base64`，最近 10 条。URL 参数：输入 ≤2000 字符时同步，超限只存历史不写 URL（写前判 `encodeURIComponent(input).length`）。

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run src/tools/base64/utils.test.ts` + 全量 预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/tools/base64/
git commit -m "feat: Base64 编解码工具"
```

---

### 任务 7：URL 编解码

**文件：**
- 创建：`src/tools/url/utils.ts`、`src/tools/url/index.tsx`
- 测试：`src/tools/url/utils.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
// encodeUrl(input: string, uriOnly?: boolean): string
// 1) encodeURIComponent 默认（空格 → %20）
// 2) uriOnly: true 用 encodeURI（不编码 :/? 等保留字符）

// decodeUrl(input: string, uriOnly?: boolean): string | { error: string }
// 3) decodeURIComponent 正确（%20 → 空格）
// 4) 非法 % 序列（'%zz'、孤立 '%E4'、'100%'）→ error，不静默返回原值、不 throw
// 5) 空串 → 空结果（非错误）
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run src/tools/url/utils.test.ts` 预期：FAIL。

- [ ] **步骤 3：实现 `utils.ts` + 组件**

组件：编码/解码双向、`encodeURI`/`decodeURI` 可选开关、输入/输出/错误区。历史 key `toolbox.history.url`，最近 10 条。URL 参数：输入 ≤2000 字符时同步，超限只存历史。

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run src/tools/url/utils.test.ts` + 全量 预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/tools/url/
git commit -m "feat: URL 编解码工具"
```

---

### 任务 8：收尾验证与 README

**文件：**
- 修改：`README.md`（构建/版本/数据契约说明）
- 确认：`public/_redirects`、所有工具历史 key、`toolbox.` 前缀

- [ ] **步骤 1：全量验证**

运行：`npm run build`（确认 `dist/_redirects` 存在）+ `npx vitest run`（全量通过）+ `npx tsc --noEmit`（如 build 未含类型检查）。

- [ ] **步骤 2：README 更新**

记录：Node 20+ 要求、`npm run dev` / `npm run build` / `npx vitest run` 命令、`toolbox.*` 数据契约（key 列表、各工具历史上限）、Cloudflare Pages 部署要点（`_redirects`、SPA 回退）。

- [ ] **步骤 3：Commit**

```bash
git add README.md
git commit -m "docs: 补全 README 与部署说明"
```

---

## 自检记录

- **规格覆盖度：** PRD §3.1 主题 → 任务 1；§3.2 骨架 → 任务 2；§3.3 历史 → 任务 2（工具库）+ 各工具任务；§3.4 URL 参数 → 任务 3/6/7；§4.1-4.5 五个工具 → 任务 3-7；§5 测试/SEO/响应式 → 各任务步骤 + 任务 8；§6 不做项 → 未列入任何任务。
- **审查重点覆盖：** 5 条已分别钉进任务 3（时间戳非法/超大数字）、任务 5（JSON 空/超大）、任务 6（中文 UTF-8、URL-safe 双向、非法 base64）、任务 7（非法 % 序列、空串）。UUID 格式（审查点外）在任务 4 步骤 1 覆盖。
- **类型一致性：** `writeHistory` 返回 `{ skipped?: boolean }`（任务 2 定义，任务 5 使用）；`readHistory` 返回 `T[]`；各工具 key 命名 `toolbox.history.<name>` 统一；`encodeBase64`/`decodeBase64`/`encodeUrl`/`decodeUrl` 签名在组件中使用一致。
- **比例：** 计划未复述规格数值（均引用 PRD 章节），每任务测试用例以规格钉死的输入/输出为断言，无「待定」「处理边界」类空行。
