# ☁️ Cloudflare Pages 部署操作手册

> 适用场景：Vite + React + TS 项目，GitHub 仓库根目录即项目根目录，构建命令 `npm run build`，输出目录 `dist`。自定义域名**从一开始就绑定**。

## 0. 前置准备

- GitHub 仓库已创建，代码已 push。
- Cloudflare 账号已注册。
- 已拥有一个域名（apex 如 `example.com`，或子域名如 `app.example.com`）。
- 本地项目根目录已包含（或即将包含）`public/_redirects`，内容为：
  ```txt
  /* /index.html 200
  ```
  这份文件会在构建时被复制到 `dist/`，Cloudflare Pages 会解析并应用 SPA 回退。

## 1. 创建 Pages 项目并连接 GitHub

1. 登录 Cloudflare Dashboard，进入 **Workers & Pages**。
2. 点击 **Create** → **Pages** → **Connect to Git**。
3. 授权 GitHub，选择你的工具箱仓库。
4. 配置构建：
   - **Framework preset**：Vite
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
   - **Root directory**：留空（仓库根目录即项目根目录）
5. 展开 **Environment variables**，添加：
   - `NODE_VERSION` = `20`（或你本地使用的 20.x 具体版本）
6. 点击 **Save and Deploy**，等待首次构建完成。
7. 访问 `https://<project>.pages.dev` 确认站点可用、SPA 子路径刷新不 404。

> Node 版本说明：Cloudflare Pages 构建镜像的 Node 默认版本可能较新，但显式设置 `NODE_VERSION=20` 最稳，避免 Vite 兼容问题。

## 2. 绑定自定义域名（核心步骤）

### 情况 A：域名已经托管在 Cloudflare（DNS 在 Cloudflare 账户下）

这是最顺畅的路径。

1. 进入 **Workers & Pages** → 你的 Pages 项目 → **Custom domains**。
2. 点击 **Set up a custom domain**。
3. 输入你的域名：
   - **子域名**（如 `toolbox.example.com`）：直接输入子域名。
   - **Apex 域名**（如 `example.com`）：直接输入 apex 域名。
4. 点击 **Continue** → **Activate domain**。
5. Cloudflare 会自动在对应 zone 中创建 DNS 记录并开启代理（橙色云朵）。
6. 等待 SSL 状态从 **Initializing** 变为 **Active**，通常 1～3 分钟。

**apex 域名特别注意**：Cloudflare 使用 **CNAME Flattening** 在 apex 上返回 A/AAAA 记录，你无需手动添加 ALIAS/ANAME。但如果状态卡在 **pending** 超过 10 分钟，已知的修复方式是 **删除该自定义域名后重新添加**。

### 情况 B：域名在外部 DNS（Namecheap / GoDaddy / Route 53 等）

1. 在 Cloudflare Pages 的 **Custom domains** 中按同样方式输入域名并 Continue，获得目标 `<project>.pages.dev`。
2. 到你的 DNS 提供商处添加记录：
   - **子域名**：CNAME，Name 为子域名，Value 为 `<project>.pages.dev`，TTL 自动或 3600。
   - **Apex 域名**：标准 CNAME 在 apex 不被 RFC 允许，你需要使用 **ALIAS 或 ANAME**（Namecheap 用 ALIAS，Route 53 用 Alias A 记录，Porkbun 支持 ALIAS；GoDaddy/Network Solutions 无原生支持，建议把 DNS 迁到 Cloudflare 或先用 `www` 子域名并做跳转）。
3. 添加后返回 Cloudflare 点击激活，等待 SSL 变成 Active。
4. 用 DNS 检查工具确认记录已传播。

## 3. 验证部署

- 访问自定义域名，确认首页和 5 个工具路径均可打开。
- **直接在地址栏访问** `/tools/json` 并刷新，确认返回 200 而非 404（验证 `_redirects` 生效）。
- 确认 HTTPS 锁标志正常。
- 确认 `*.pages.dev` 默认域名也可访问（除非你有意关闭）。

## 4. 自动部署验证

1. 在本地随意改一行文字或样式。
2. `git add . && git commit -m "test auto deploy" && git push`。
3. 回到 Cloudflare Pages，确认新的构建被触发且状态为 **Success**。
4. 刷新自定义域名，确认改动已生效。

此后每次 push 到生产分支都会自动重新部署，无需任何手动操作。

## 5. 常见问题与避坑

| 现象                           | 可能原因                          | 处理                                                   |
| ------------------------------ | --------------------------------- | ------------------------------------------------------ |
| 直接访问 `/tools/xxx` 404      | `_redirects` 未进入 `dist`        | 确认文件在 `public/` 下且构建后 `dist/_redirects` 存在 |
| 构建失败提示 Node 版本         | 未设 `NODE_VERSION`               | 在环境变量中加 `NODE_VERSION=20`                       |
| 自定义域名卡在 pending         | apex 同 zone 偶发                 | 删除自定义域名后重新添加                               |
| SSL 一直 Initializing          | DNS 未完全传播或外部 DNS 配置错误 | 用 DNS 检查工具确认 CNAME/ALIAS 指向正确               |
| apex 域名在外部 DNS 无法 CNAME | RFC 限制                          | 使用 ALIAS/ANAME，或将 DNS 迁移到 Cloudflare           |

---

两份文档就到这里。如果你后续想让 Claude Code 按 PRD 直接开工，建议把 PRD 的 **第 3、4、8 节** 作为主要输入；部署手册的第 1、2 节是你需要手动在 Cloudflare 控制台执行的部分。需要我针对其中某一部分再展开吗？