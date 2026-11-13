# 会话交接（Handoff）

> 规则：每个会话结束前（或 PreCompact 时）更新本文件；新会话第一步读它。保持 ≤ 60 行，超长就压缩/归档旧条目。

## 当前状态

- 项目阶段：MVP 代码完成（含交互打磨 + favicon），**main 领先 origin/main 6 个本地提交未 push**。
- 已合并 main（本地，commits `cbe0ed0..a345124`）：
  - 脚手架（Vite + React 18 + TS + Tailwind dark: + Vitest）、`public/_redirects`
  - 主题 FOUC 脚本 + `toolbox.pref.theme` 持久化
  - 通用组件 5 个 + `src/lib/history.ts`（11 测试）
  - 5 个工具（时间戳/UUID/JSON/Base64/URL），纯函数+组件拆分，85 测试全绿
  - 交互打磨（75e40ae）：示例自动转换、URL 参数还原选项、onPick 还原模式
  - favicon（f38cd4b，SVG 靛蓝渐变工具箱）、gitignore 补 `.vite/`/`__pycache__/`
- 验证：`npm run build` ✓ + 85/85 测试 ✓。

## 未完成任务

- **push main → Cloudflare Pages 首次部署**（等用户确认；push 前可 `npm run dev` 人工过一遍 5 个工具页）
- PRD §7 自定义域名绑定（首次部署后）
- 未做（PRD 明确不做项，非遗漏）：PWA/E2E/SSR、UUID v7、MD5/Cron（v1.1 候选）

## 已知坑 / 决策记录

- 2026-11-12 `npx` 被 harness 拦截 → vitest 用 `node node_modules/vitest/vitest.mjs run`（细节见 memory `npx-blocked-vitest-workaround`）。
- 2026-11-12 实现中途用户放弃子代理改内联执行；长计划先问执行方式（memory `execution-mode-preference`）。
- 2026-11-12 计划文件 `docs/superpowers/plans/` 随代码进了仓库，属可撤销决策，不主动维护（memory `plan-file-committed-in-repo`）。
- 2026-11-12 Base64/URL 的 URL 参数名（q/m/us/uri）自定；Base64/URL 历史条目带 `B:`/`U:` 元数据前缀（旧条目兼容）。
- 2026-11-11 规则文件约定：rules 装不变量，PRD 装规格数值；`toolbox.` key 前缀为数据契约变更走 §5 硬停。

## 关键文件指引

- PRD：`docs/个人Web工具箱（Toolbox）_PRD.md`；部署手册：`docs/Cloudflare Pages 部署操作手册.md`
- 账本：`.superpowers/sdd/2026-11-12-toolbox-mvp/progress.md`（被 gitignore 的 `*` 忽略，仅本地）

## 常用操作速记

- `npm run dev` / `npm run build` / `node node_modules/vitest/vitest.mjs run`
- 上下文 ~70% 主动 `/compact`；收尾跑 `/wrapup`。
