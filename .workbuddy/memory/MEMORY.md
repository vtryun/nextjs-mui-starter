# MEMORY.md — nextjs-mui-starter 项目长期约定

## 高风险：本项目没有版本控制

- **项目不在 git 仓库下**（无 `.git`），且这台机器的 `git` 命令本身无法启动（`error launching git`）。**任何改动都没有回滚点。**
- 2026-09-14 发生过一次工作区被整体回滚的事故：新增文件消失、`pnpm-workspace.yaml` 被改名成 `.bak`、`node_modules/` 与 `.workbuddy/` 被清空，最后只能从对话上下文逐文件重建。
- **结论：动结构性改动之前，先把要改的文件复制一份到项目外的目录**（例如 `E:\project\_backup\<日期>\`）。不要依赖工作区自身留存历史。

## 技术栈与既定决策（勿随意改动）

- pnpm + Next.js 16（App Router，React Compiler）+ MUI v9 + Prisma 7（driver adapter）+ better-auth + Zod + react-hook-form + TanStack Query + Redux Toolkit。
- 认证：better-auth 同时启用 `username` 插件，`displayUsername: false`（服务端与 `usernameClient` 必须保持一致）。登录接受邮箱或用户名。
- **字段职责不可互换**：`name`（`String`，无唯一约束）是展示名；`username`（`String?`，`@@unique`）是登录凭据。`name` 不唯一，所以永远不能当登录标识用。
- **列名可以映射但不能"互换"**：核心字段走顶层 `user: { fields: { name: '实际列名' } }`；插件字段走插件自己的 `schema.user.fields`（已核实 `UsernameOptions.schema?: InferOptionSchema<UsernameSchema>`），例如 `username({ schema: { user: { fields: { username: 'login_name' } } } })`。改列名要同步 Prisma schema + migration，且 better-auth 的 `advanced.database.validateSchema` 默认开启，列名对不上会启动即报错。
- 会话读取一律走 `src/lib/session.ts` 的 `getSession()`（React `cache` 包裹），不要在 layout/page 里直接调 `auth.api.getSession` —— 会导致每请求两次查询。
- 所有 Zod schema 在 `src/validations/auth.ts` 里都有服务端镜像，经 `src/lib/auth.ts` 的 `hooks.before` 施加。新增写接口时必须同时加服务端校验。
- 邮件出口只有 `src/lib/mail.ts` 的 `sendMail()` 一处；接服务商只改这个文件。
- 邮件生产环境未配置时**抛错**，这是有意设计，不要改成静默返回。
- 未启用 `requireEmailVerification`（没有可用邮件服务会把新用户锁在门外）。
- `src/app/(protected)/` 下的路由由 `layout.tsx` 统一做会话守卫；本项目刻意不使用 `middleware.ts`。
- 代码风格：`.prettierrc` 为 singleQuote + 2 空格 + 无分号。改完跑 `pnpm format`。

## 环境相关（详见用户级 MEMORY.md）

- `pnpm` 通过 `corepack enable pnpm` 提供，垫片在 `C:\Users\zhangjinhui\.workbuddy\binaries\node\versions\22.22.2\`。
- 本项目在 E 盘，pnpm 11 用 `E:\.pnpm-store\v11` 作为 store（已预热约 865 MB）。
- 注册表为 `registry.npmmirror.com`，单请求 26–30 秒，全新拉包极慢。
