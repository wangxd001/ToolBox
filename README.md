# Toolbox

纯前端 Web 工具集合：时间戳 / UUID / JSON / Base64 / URL 五个工具。无后端、无登录，数据不出浏览器。

## 技术栈

Vite + React 18 + TypeScript + react-router-dom（BrowserRouter）+ Tailwind CSS + Vitest。部署 Cloudflare Pages。

## 环境要求

- Node 20+
- npm 10+

## 命令

```bash
npm install          # 安装依赖
npm run dev          # 本地开发（Vite dev server）
npm run build        # 类型检查（tsc -b）+ 构建到 dist/
npx vitest run       # 运行全部测试（纯函数）
```

## 部署

Cloudflare Pages，构建命令 `npm run build`，输出目录 `dist`。

`public/_redirects` 内容为 `/* /index.html 200`，保证 SPA 子路径直接访问与刷新不 404（构建时随产物输出到 `dist/_redirects`）。

GitHub push 自动构建部署；自定义域名从首次部署即绑定。

## 本地数据契约（localStorage）

所有 key 带 `toolbox.` 前缀，运行时数据只存浏览器 localStorage，不上传任何服务器。

| key | 内容 | 上限 |
| --- | --- | --- |
| `toolbox.pref.theme` | 主题选择（`'light'`/`'dark'`） | — |
| `toolbox.history.timestamp` | 时间戳转换历史 | 最近 10 条 |
| `toolbox.history.uuid` | UUID 生成历史（整批） | 最近 10 条 |
| `toolbox.history.json` | JSON 工具历史 | 最近 5 条，单条 ≤100KB（超限不写入并提示「超出历史上限」） |
| `toolbox.history.base64` | Base64 编解码历史 | 最近 10 条 |
| `toolbox.history.url` | URL 编解码历史 | 最近 10 条 |

读取容错：key 不存在或 JSON 解析失败时视为空，不崩溃。

## 工具 URL 参数

| 工具 | 参数 | 限制 |
| --- | --- | --- |
| 时间戳 | `ts`、`unit`（`s`/`ms`）、`mode`（`toTime`/`toTs`） | 无特殊限制 |
| Base64 | 输入/输出状态 | 输入 ≤2000 字符才写 URL，超限只存历史 |
| URL 编解码 | 同上 | 同上 |
| UUID / JSON | 不支持 | — |

读取 URL 参数必须校验，非法值回退默认值并给非阻塞提示。
