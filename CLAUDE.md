<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->

# 项目约束

> 本文件与 `.claude/rules/` 是模型遵循的项目上下文约束，不是操作系统级安全机制。真正的强制层是 `.claude/settings.json` 的 allow/ask/deny、hooks、CI、测试和用户确认；关键约束必须在这些层面兜底。

## 1. 项目身份

Toolbox：纯前端 Web 工具集合（时间戳 / UUID / JSON / Base64 / URL 五个工具），无后端、无登录、数据不出浏览器。技术栈：Vite + React 18 + TypeScript + react-router-dom（BrowserRouter）+ Tailwind CSS + Vitest；部署 Cloudflare Pages。产品行为一律以 PRD 为准；实现手法层的不变量沉淀在 `.claude/rules/`（见 §3、§4），本文件只列不可协商的边界。

## 2. 资料优先级

1. `docs/个人Web工具箱（Toolbox）_PRD.md`（需求来源，优先级最高）。
2. `docs/decisions/未决问题.md`：未决问题和提案；未获用户确认前不是规则。
3. 当前代码：只是工程现状，不是需求来源；模板代码和未完成实现不得当作规则。

旧版资料、聊天记录、未验证记忆不得补入冲突规则；PRD 未定义的问题先记入 `docs/decisions/未决问题.md`，等待确认。

## 3. 规则文件

全部规则通过 `@` 导入：

- @.claude/rules/01-纯前端边界.md
- @.claude/rules/02-可测试性.md
- @.claude/rules/03-本地数据契约.md
- @.claude/rules/04-UI与主题.md

进入对应领域前，必须已加载该领域规则；规则冲突时 PRD 优先。

## 4. 已确认硬约束（索引）

具体规格以 PRD 为准；实现手法层的不变量见各规则文件（owner 见 §3 导入）：

| 约束 | 详情 | owner 文件 |
| --- | --- | --- |
| 无后端、数据不出浏览器、静态托管、禁时区库 | 架构层不变量 | [01-纯前端边界](.claude/rules/01-纯前端边界.md) |
| 纯函数+组件拆分、Vitest 只测纯函数、5 组必测、非 happy path | 测试覆盖 | [02-可测试性](.claude/rules/02-可测试性.md) |
| localStorage key 前缀、历史上限（JSON 5 条/≤100KB）、URL 参数校验回退、清空历史 | 数据契约 | [03-本地数据契约](.claude/rules/03-本地数据契约.md) |
| Tailwind `dark:` 主题、工具页骨架、响应式 ≥44px、每路由 SEO | UI 层 | [04-UI与主题](.claude/rules/04-UI与主题.md) |

PRD 中的产品规格数值（路由表、UUID 批量 1~100、UUID v4/无 v7、URL 参数 ≤2000 字符、主题持久化验收等）以 PRD 正文为唯一来源，不在此复述。

## 5. 变更协议（硬停）

修改以下内容前，必须先说明影响并等待用户明确确认：

- 上表任一硬约束，及其 owner 规则文件（含 MVP 边界与历史记录/URL 参数规则）。
- 技术栈选型（构建工具、框架、路由、样式、测试、部署目标）或页面路由结构（PRD 第 2 节）。
- 数据契约：`localStorage` key 命名、历史记录结构、URL 参数名与取值。
- `docs/decisions/未决问题.md` 中的问题：用户确认后才可转为规则。
- PRD 本身：PRD 变更须用户确认，确认后同步更新本文件第 4 节与对应规则文件。

## 6. 工作流

- Think before coding：显式声明假设；有多种解读时列出；有更简方案直接说明。
- 简洁优先：不写超出需求的功能，不做单用抽象。
- 功能需求先设计/拆解，再写测试，再实现。
- 手术式改动：只动必须动的，匹配现有风格；每个改动行能追溯到需求。
- 完成前必须运行验证命令并报告实际输出；未运行不得声称通过（与 §7 互为校验）。
- 每个业务实现必须有对应测试，不能只覆盖 happy path。
- 实现新工具时遵循 PRD 第 8 节顺序：脚手架/布局 → 通用组件（`ToolLayout`、`CopyButton`、`ErrorText`、`ExampleButton`、`HistoryPanel`）→ 工具按「纯函数 + 组件」拆分，纯函数放对应 `utils` 供 Vitest 测试 → 最后补 `public/_redirects` 和测试。

## 7. 完成定义

代码 + 对应测试 + `npm run build` 与 `npx vitest run` 实际通过 + 涉及部署时验证 `_redirects` 存在 + 涉及构建/版本/数据契约时更新 README。仅编译通过、仅生成代码、仅口头说明 = 未完成。

## 8. 会话交接

新会话先读 `.claude/handoff.md`；memory 索引由 harness 注入，按需读取。会话结束或上下文将满前跑 `/wrapup`，更新 handoff 和 memory。memory 只写无法从代码/git 历史推导的信息。

- 红线：全局 `PreToolUse` guard 会在 `git push`、`rm -rf`、`git reset --hard` 等命令前阻断并要求确认，属预期行为，不要绕过。
- 删除文件、目录或 git 历史前必须先问用户，即使处于 auto-accept 模式。
- 不自动 `git commit` / `git push`，除非用户明确要求；提交用 Conventional Commits：feat/fix/chore/refactor + 简短中文描述。
- 收尾：新决策/踩坑写入 memory，未完成状态更新 handoff。

