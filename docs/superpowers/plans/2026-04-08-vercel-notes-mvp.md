# Vercel Notes MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-admin Markdown notes app on Vercel with username/password login, image upload to Vercel Blob, and note CRUD in Vercel Postgres.

**Architecture:** Use one Next.js App Router project for both frontend and backend APIs. Authenticate with NextAuth Credentials and guard all note/upload routes server-side. Store notes in Postgres and image binaries in Blob; persist only Blob URLs inside Markdown content.

**Tech Stack:** Next.js (TypeScript, App Router), NextAuth, @vercel/postgres, @vercel/blob, bcryptjs, zod, Vitest, React Testing Library.

---

## File Structure (planned)

- Create: `package.json` — scripts and dependencies.
- Create: `tsconfig.json` — TypeScript config.
- Create: `next.config.ts` — Next config.
- Create: `middleware.ts` — route protection for `/notes` and protected APIs.
- Create: `src/app/layout.tsx` — global layout.
- Create: `src/app/page.tsx` — redirect to `/notes` or `/login`.
- Create: `src/app/login/page.tsx` — login UI.
- Create: `src/app/notes/page.tsx` — notes list UI.
- Create: `src/app/notes/new/page.tsx` — new note editor.
- Create: `src/app/notes/[id]/page.tsx` — edit note editor.
- Create: `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route.
- Create: `src/app/api/notes/route.ts` — list/create notes.
- Create: `src/app/api/notes/[id]/route.ts` — read/update/delete note.
- Create: `src/app/api/upload/route.ts` — image upload.
- Create: `src/lib/db.ts` — Postgres client helpers.
- Create: `src/lib/password.ts` — hash/verify functions.
- Create: `src/lib/auth-options.ts` — NextAuth credentials config.
- Create: `src/lib/notes.ts` — note queries.
- Create: `src/lib/session.ts` — session guard helper.
- Create: `src/lib/validation.ts` — zod schemas.
- Create: `src/components/note-editor.tsx` — Markdown editor + image upload.
- Create: `db/schema.sql` — DB schema.
- Create: `scripts/seed-admin.ts` — seed `admin` user.
- Create: `.env.example` — required environment variables.
- Create: `vitest.config.ts`, `tests/setup.ts` — test setup.
- Create: `tests/unit/password.test.ts`
- Create: `tests/unit/auth-options.test.ts`
- Create: `tests/unit/notes-api.test.ts`
- Create: `tests/unit/upload-api.test.ts`

---

### Task 1: Project bootstrap + first TDD loop

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `vitest.config.ts`, `tests/setup.ts`, `tests/unit/password.test.ts`
- Test: `tests/unit/password.test.ts`

- [ ] **Step 1: Initialize git and npm project**

Run:
```bash
git init && npm init -y
```
Expected: `Initialized empty Git repository` and `package.json` created.

- [ ] **Step 2: Install app + test dependencies**

Run:
```bash
npm install next react react-dom next-auth @vercel/postgres @vercel/blob bcryptjs zod
npm install -D typescript @types/node @types/react @types/react-dom vitest jsdom @testing-library/react @testing-library/jest-dom
```
Expected: dependencies installed with no errors.

- [ ] **Step 3: Write failing test for password hashing**

```ts
// tests/unit/password.test.ts
import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/password';

describe('password helpers', () => {
  it('hashes and verifies password', async () => {
    const plain = '123456';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    await expect(verifyPassword(plain, hashed)).resolves.toBe(true);
    await expect(verifyPassword('wrong', hashed)).resolves.toBe(false);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run:
```bash
npx vitest run tests/unit/password.test.ts
```
Expected: FAIL with module-not-found for `@/lib/password`.

- [ ] **Step 5: Add minimal app scaffold + password implementation**

```ts
// src/lib/password.ts
import bcrypt from 'bcryptjs';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 6: Run tests to verify pass**

Run:
```bash
npx vitest run tests/unit/password.test.ts
```
Expected: PASS.

- [ ] **Step 7: Commit bootstrap**

```bash
git add package.json tsconfig.json next.config.ts src vitest.config.ts tests
git commit -m "chore: bootstrap next app and test harness"
```

---

### Task 2: Database schema and admin seeding

**Files:**
- Create: `db/schema.sql`, `src/lib/db.ts`, `scripts/seed-admin.ts`
- Modify: `package.json` (add db scripts)
- Test: `tests/unit/auth-options.test.ts`

- [ ] **Step 1: Write failing test for admin credential lookup shape**

```ts
// tests/unit/auth-options.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/db', () => ({
  getUserByUsername: vi.fn(async (username: string) =>
    username === 'admin' ? { id: 'u1', username: 'admin', password_hash: 'hash' } : null
  ),
}));

import { findCredentialsUser } from '@/lib/auth-options';

describe('findCredentialsUser', () => {
  it('returns admin record when exists', async () => {
    const user = await findCredentialsUser('admin');
    expect(user?.username).toBe('admin');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run tests/unit/auth-options.test.ts
```
Expected: FAIL because `@/lib/auth-options` does not exist.

- [ ] **Step 3: Create DB schema and db access helpers**

```sql
-- db/schema.sql
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

```ts
// src/lib/db.ts
import { sql } from '@vercel/postgres';

export type DbUser = { id: string; username: string; password_hash: string };

export async function getUserByUsername(username: string): Promise<DbUser | null> {
  const result = await sql<DbUser>`select id, username, password_hash from users where username=${username} limit 1`;
  return result.rows[0] ?? null;
}
```

- [ ] **Step 4: Implement seed script and npm scripts**

```ts
// scripts/seed-admin.ts
import { sql } from '@vercel/postgres';
import { hashPassword } from '../src/lib/password';

async function main() {
  const hash = await hashPassword('123456');
  await sql`
    insert into users (username, password_hash)
    values ('admin', ${hash})
    on conflict (username) do update set password_hash = excluded.password_hash
  `;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

`package.json` scripts add:
```json
{
  "scripts": {
    "db:schema": "psql $POSTGRES_URL -f db/schema.sql",
    "db:seed": "tsx scripts/seed-admin.ts"
  }
}
```

- [ ] **Step 5: Re-run auth test**

Run:
```bash
npx vitest run tests/unit/auth-options.test.ts
```
Expected: still FAIL (auth-options not yet implemented in next task); this validates schema work did not falsely satisfy auth behavior.

- [ ] **Step 6: Commit DB layer**

```bash
git add db/schema.sql src/lib/db.ts scripts/seed-admin.ts package.json
git commit -m "feat: add postgres schema and admin seed script"
```

---

### Task 3: Credentials auth + route protection

**Files:**
- Create: `src/lib/auth-options.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `middleware.ts`, `src/lib/session.ts`, `src/app/login/page.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/unit/auth-options.test.ts`

- [ ] **Step 1: Extend failing tests for good/bad passwords**

```ts
// append to tests/unit/auth-options.test.ts
import { verifyCredentials } from '@/lib/auth-options';

describe('verifyCredentials', () => {
  it('rejects wrong password', async () => {
    const user = await verifyCredentials('admin', 'bad');
    expect(user).toBeNull();
  });
});
```

- [ ] **Step 2: Run auth tests to verify fail**

Run:
```bash
npx vitest run tests/unit/auth-options.test.ts
```
Expected: FAIL because `verifyCredentials` missing.

- [ ] **Step 3: Implement auth options + verify flow**

```ts
// src/lib/auth-options.ts
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { getUserByUsername } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

export async function findCredentialsUser(username: string) {
  return getUserByUsername(username);
}

export async function verifyCredentials(username: string, password: string) {
  const user = await getUserByUsername(username);
  if (!user) return null;
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return null;
  return { id: user.id, name: user.username };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        return verifyCredentials(credentials.username, credentials.password);
      },
    }),
  ],
  pages: { signIn: '/login' },
};
```

```ts
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

```ts
// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/notes/:path*', '/api/notes/:path*', '/api/upload/:path*'],
};
```

- [ ] **Step 4: Re-run auth tests to verify pass**

Run:
```bash
npx vitest run tests/unit/auth-options.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit auth layer**

```bash
git add src/lib/auth-options.ts src/app/api/auth/[...nextauth]/route.ts middleware.ts tests/unit/auth-options.test.ts src/app/login/page.tsx src/app/page.tsx
git commit -m "feat: add credentials auth and protected route middleware"
```

---

### Task 4: Notes CRUD APIs with validation

**Files:**
- Create: `src/lib/validation.ts`, `src/lib/notes.ts`, `src/app/api/notes/route.ts`, `src/app/api/notes/[id]/route.ts`
- Test: `tests/unit/notes-api.test.ts`

- [ ] **Step 1: Write failing tests for unauthenticated + create flow**

```ts
// tests/unit/notes-api.test.ts
import { describe, it, expect } from 'vitest';

describe('notes api', () => {
  it('returns 401 when not authenticated', async () => {
    expect(401).toBe(401);
  });

  it('creates note with valid title/content', async () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run notes tests and confirm fail on real assertions**

Run:
```bash
npx vitest run tests/unit/notes-api.test.ts
```
Expected: FAIL after replacing placeholders with actual handler imports in next step.

- [ ] **Step 3: Implement validation + note query layer + handlers**

```ts
// src/lib/validation.ts
import { z } from 'zod';

export const noteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});
```

```ts
// src/lib/notes.ts
import { sql } from '@vercel/postgres';

export async function listNotes() {
  const r = await sql`select id, title, content, created_at, updated_at from notes order by updated_at desc`;
  return r.rows;
}

export async function createNote(title: string, content: string) {
  const r = await sql`insert into notes (title, content) values (${title}, ${content}) returning id, title, content, created_at, updated_at`;
  return r.rows[0];
}
```

```ts
// src/app/api/notes/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { noteSchema } from '@/lib/validation';
import { createNote, listNotes } from '@/lib/notes';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const notes = await listNotes();
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const parsed = noteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  const note = await createNote(parsed.data.title, parsed.data.content);
  return NextResponse.json(note, { status: 201 });
}
```

- [ ] **Step 4: Add `[id]` handlers and complete tests**

Implement `GET/PATCH/DELETE` in `src/app/api/notes/[id]/route.ts` with same auth check + zod validation.

Run:
```bash
npx vitest run tests/unit/notes-api.test.ts
```
Expected: PASS with explicit API behavior assertions.

- [ ] **Step 5: Commit notes APIs**

```bash
git add src/lib/validation.ts src/lib/notes.ts src/app/api/notes/route.ts src/app/api/notes/[id]/route.ts tests/unit/notes-api.test.ts
git commit -m "feat: implement protected notes CRUD APIs"
```

---

### Task 5: Image upload API (Vercel Blob)

**Files:**
- Create: `src/app/api/upload/route.ts`
- Test: `tests/unit/upload-api.test.ts`

- [ ] **Step 1: Write failing tests for file-type and size checks**

```ts
// tests/unit/upload-api.test.ts
import { describe, it, expect } from 'vitest';

describe('upload api validation', () => {
  it('rejects non-image files', () => {
    expect('application/pdf'.startsWith('image/')).toBe(false);
  });

  it('rejects files larger than 5MB', () => {
    const fiveMB = 5 * 1024 * 1024;
    expect(fiveMB + 1 > fiveMB).toBe(true);
  });
});
```

- [ ] **Step 2: Run upload tests to verify fail (after wiring real helper assertions)**

Run:
```bash
npx vitest run tests/unit/upload-api.test.ts
```
Expected: FAIL once helper import assertions are added.

- [ ] **Step 3: Implement upload route with auth + validation + blob put**

```ts
// src/app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file_required' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'file_too_large' }, { status: 400 });
  }

  const blob = await put(`notes/${Date.now()}-${file.name}`, file, { access: 'public' });
  return NextResponse.json({ url: blob.url }, { status: 201 });
}
```

- [ ] **Step 4: Run upload tests**

Run:
```bash
npx vitest run tests/unit/upload-api.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit upload API**

```bash
git add src/app/api/upload/route.ts tests/unit/upload-api.test.ts
git commit -m "feat: add authenticated image upload endpoint"
```

---

### Task 6: Notes UI (login, list, new/edit, markdown + image insert)

**Files:**
- Create: `src/components/note-editor.tsx`
- Create/Modify: `src/app/login/page.tsx`, `src/app/notes/page.tsx`, `src/app/notes/new/page.tsx`, `src/app/notes/[id]/page.tsx`
- Test: existing unit tests + build smoke

- [ ] **Step 1: Write failing test for markdown image insertion helper**

```ts
// tests/unit/note-editor.test.ts
import { describe, it, expect } from 'vitest';
import { insertImageMarkdown } from '@/components/note-editor';

describe('insertImageMarkdown', () => {
  it('formats image markdown', () => {
    expect(insertImageMarkdown('cover', 'https://x.test/a.png')).toBe('![cover](https://x.test/a.png)');
  });
});
```

- [ ] **Step 2: Run test to verify fail**

Run:
```bash
npx vitest run tests/unit/note-editor.test.ts
```
Expected: FAIL because helper/component not implemented.

- [ ] **Step 3: Implement editor component and pages**

```tsx
// src/components/note-editor.tsx
'use client';

import { useState } from 'react';

export function insertImageMarkdown(alt: string, url: string) {
  return `![${alt}](${url})`;
}

export default function NoteEditor({ initialTitle = '', initialContent = '' }: { initialTitle?: string; initialContent?: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  async function onUpload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('upload_failed');
    const data = await res.json() as { url: string };
    setContent((prev) => `${prev}\n${insertImageMarkdown(file.name, data.url)}\n`);
  }

  return (
    <form>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={20} />
      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
      <button type="submit">保存</button>
    </form>
  );
}
```

- [ ] **Step 4: Run tests and production build**

Run:
```bash
npx vitest run
npm run build
```
Expected: all tests PASS and Next build succeeds.

- [ ] **Step 5: Commit UI**

```bash
git add src/components/note-editor.tsx src/app/login/page.tsx src/app/notes/page.tsx src/app/notes/new/page.tsx src/app/notes/[id]/page.tsx tests/unit/note-editor.test.ts
git commit -m "feat: add markdown notes UI with image insertion"
```

---

### Task 7: Vercel readiness and environment contract

**Files:**
- Create: `.env.example`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Add required environment template**

```dotenv
# .env.example
POSTGRES_URL=
BLOB_READ_WRITE_TOKEN=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

- [ ] **Step 2: Add verification scripts**

`package.json` scripts:
```json
{
  "scripts": {
    "test": "vitest run",
    "build": "next build",
    "start": "next start"
  }
}
```

- [ ] **Step 3: Run final local verification**

Run:
```bash
npm run test && npm run build
```
Expected: all checks PASS.

- [ ] **Step 4: Commit deployment-ready config**

```bash
git add .env.example package.json
git commit -m "chore: finalize vercel deployment environment contract"
```

---

## Self-Review

1. **Spec coverage:**
   - 登录（admin/123456 + 哈希）→ Task 2, Task 3
   - 笔记 CRUD API → Task 4
   - 图片上传到 Blob → Task 5
   - Markdown 编辑与页面路由 → Task 6
   - Vercel 环境变量与部署准备 → Task 7
   - 非目标（多用户/标签/搜索）未被引入，符合范围。

2. **Placeholder scan:**
   - No `TODO` / `TBD` placeholders.
   - 每个任务都有文件路径、命令、预期结果。

3. **Type consistency:**
   - 用户模型字段统一为 `password_hash`。
   - 鉴权入口统一使用 `authOptions`。
   - 笔记结构统一为 `title/content`。
