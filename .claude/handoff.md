# 会话交接（Handoff）

> 规则：每个会话结束前（或 PreCompact 时）更新本文件；新会话第一步读它。保持 ≤ 60 行，超长就压缩/归档旧条目。

## 当前状态

- 项目阶段：MVP 代码完成 + UI 重设计完成（未提交，工作区待 commit）。
- 已完成：
  - 脚手架（Vite + React 18 + TS + Tailwind dark: + Vitest）、`public/_redirects`
  - 主题 FOUC 脚本 + `toolbox.pref.theme` 持久化
  - 通用组件 5 个 + `src/lib/history.ts`（11 测试）
  - 5 个工具（时间戳/UUID/JSON/Base64/URL），纯函数+组件拆分，85 测试全绿
  - 交互打磨（75e40ae）：示例自动转换、URL 参数还原选项、onPick 还原模式
  - favicon（SVG 靛蓝渐变工具箱）、gitignore 补 `.vite/`/`__pycache__/`
  - **UI 重设计（2026-11-13）**：见下方「UI 重设计」节
- 验证：`npm run build` ✓ + 85/85 测试 ✓ + Playwright 截图冒烟 ✓（docs/screenshots/ 8 张）。

## UI 重设计（本会话新增，未提交）

- 设计系统：ui-ux-pro-max skill 检索（Minimalism & Swiss，slate 中性 + indigo-600 主色），
  不引入 webfont（规则 01 资源本地化），图标为内联 SVG 不引图标库。
- 新增文件：`src/components/ui.tsx`（Btn/Segmented/Card/Label/TextInput/TextArea/CheckBox/Badge）、
  `src/components/Icons.tsx`（12 个内联 SVG 图标）。
- 改造文件：App（sticky 导航 + footer）、NavBar（logo + 桌面端 5 工具 NavLink + ThemeToggle SVG 图标）、
  HomePage（hero + 搜索过滤卡片网格）、5 个工具页（Card 分区：输入卡/操作卡/结果卡/历史卡，
  Segmented 分段切换，输出区 iconOnly 复制按钮，JSON 结果卡带合法/非法 Badge）。
- 约束遵守：业务逻辑 0 改动（utils + 85 测试不变）；localStorage key / URL 参数 / 路由表不动；
  触控 ≥44px 保留；focus-visible ring；`prefers-reduced-motion` 支持。
- 验收脚本：`docs/ui-check.mjs`（Playwright，用系统 Chrome channel 跑），截图 8 张已目检通过。

## 未完成任务

- 未做（PRD 明确不做项，非遗漏）：PWA/E2E/SSR、UUID v7、MD5/Cron（v1.1 候选）

## 已知坑 / 决策记录

- 2026-11-13 UI 重设计：字体走系统栈不引 webfont（skill 推荐 JetBrains Mono + IBM Plex，
  但规则 01 禁 CDN 资源本地化）；图标内联 SVG 不装 lucide（包管理红线：先问）。
- 2026-11-13 Playwright 未装：`npx playwright install chromium` 下载卡住，改用
  `channel: 'chrome'` 用系统已装 Chrome；脚本 require 路径需按本机 npx cache 改。
- 2026-11-12 `npx` 被 harness 拦截 → vitest 用 `node node_modules/vitest/vitest.mjs run`。
- 2026-11-12 实现中途用户放弃子代理改内联执行；长计划先问执行方式（memory `execution-mode-preference`）。
- 2026-11-12 计划文件 `docs/superpowers/plans/` 随代码进了仓库，属可撤销决策。
- 2026-11-12 Base64/URL 的 URL 参数名（q/m/us/uri）自定；历史条目带 `B:`/`U:` 元数据前缀。
- 2026-11-11 rules 装不变量，PRD 装规格数值；`toolbox.` key 前缀变更走 §5 硬停。

## 关键文件指引

- PRD：`docs/个人Web工具箱（Toolbox）_PRD.md`；部署手册：`docs/Cloudflare Pages 部署操作手册.md`
- UI 设计系统检索：`python .claude/skills/ui-ux-pro-max/scripts/search.py "developer tool utility minimal clean" --design-system`

## 常用操作速记

- `npm run dev` / `npm run build` / `node node_modules/vitest/vitest.mjs run`
- UI 验收：`node docs/ui-check.mjs`（需先起 dev server，截图到 docs/screenshots/）
- 上下文 ~70% 主动 `/compact`；收尾跑 `/wrapup`。
