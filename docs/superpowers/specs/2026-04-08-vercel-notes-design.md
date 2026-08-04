# Vercel 全栈 Markdown 笔记系统设计（MVP）

- 日期：2026-04-08
- 目标：部署一个仅个人可登录使用的笔记系统，支持 Markdown 内容、图片上传、笔记 CRUD。
- 约束：全部使用 Vercel 生态（部署、数据库、对象存储）。

## 1. 架构

- 框架：Next.js（App Router + TypeScript）单仓库全栈。
- 部署：Vercel（Web + API 同项目）。
- 认证：NextAuth Credentials，仅允许管理员账号登录。
- 数据：Vercel Postgres。
- 存储：Vercel Blob（图片）。

## 2. 功能范围（MVP）

- 登录：账号密码登录（初始账号 `admin`，初始密码 `123456`）。
- 笔记：
  - 创建笔记
  - 编辑笔记
  - 删除笔记
  - 列表查看
- 内容：Markdown 文本。
- 图片：上传后返回 URL，插入到 Markdown。

## 3. 页面与路由

- `/login`：登录页。
- `/notes`：笔记列表页。
- `/notes/new`：新建笔记页。
- `/notes/[id]`：编辑笔记页。

## 4. API 设计

- `GET /api/notes`：获取笔记列表。
- `POST /api/notes`：新建笔记。
- `GET /api/notes/[id]`：获取单条笔记。
- `PATCH /api/notes/[id]`：更新笔记。
- `DELETE /api/notes/[id]`：删除笔记。
- `POST /api/upload`：上传图片到 Vercel Blob，返回可访问 URL。

## 5. 数据模型

### users
- `id` (uuid, pk)
- `username` (text, unique, not null)
- `password_hash` (text, not null)
- `created_at` (timestamp)

### notes
- `id` (uuid, pk)
- `title` (text, not null)
- `content` (text, not null)
- `created_at` (timestamp)
- `updated_at` (timestamp)

> 当前需求仅个人使用，`notes` 不强制 owner 字段；后续多用户时再扩展。

## 6. 安全与访问控制

- 密码只存 bcrypt 哈希，不存明文。
- 未登录访问 `/notes*` 和受保护 API 时返回重定向/401。
- `/api/upload` 校验登录态后才允许上传。
- 图片上传限制类型（image/*）和大小（MVP 先设 5MB）。

## 7. 数据流

1. 用户在 `/login` 提交账号密码。
2. NextAuth Credentials 校验数据库中 `admin` 的哈希密码。
3. 登录成功后访问 `/notes`。
4. 编辑页上传图片 -> `/api/upload` -> Blob URL -> 插入 Markdown。
5. 保存时调用 `POST/PATCH /api/notes` 写入 Postgres。

## 8. 错误处理

- 登录失败：统一提示“账号或密码错误”。
- 上传失败：提示失败原因（文件过大/格式错误/网络错误）。
- 保存失败：前端 toast + 保留编辑内容。
- 数据不存在（404）：编辑页给出“笔记不存在”并返回列表入口。

## 9. 测试策略

- 单元测试：
  - 密码哈希/校验工具函数。
  - 笔记请求参数校验。
- API 测试：
  - 未登录访问受保护接口应失败。
  - 登录后 CRUD 成功路径。
- 基础冒烟：
  - 本地启动后完成“登录 -> 新建笔记 -> 上传图片 -> 保存 -> 列表显示”。

## 10. 部署配置

- Vercel 项目环境变量（Production/Preview）：
  - `POSTGRES_URL`（Vercel Postgres）
  - `BLOB_READ_WRITE_TOKEN`（Vercel Blob）
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`（生产域名）

## 11. 非目标（MVP 不做）

- 多用户系统
- 标签、搜索
- 历史版本
- 富文本编辑器
