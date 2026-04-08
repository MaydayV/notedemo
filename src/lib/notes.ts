import { sql } from '@vercel/postgres';
import type { DbNote } from '@/lib/db';

export async function listNotes(): Promise<DbNote[]> {
  const result = await sql<DbNote>`
    select id, title, content, created_at, updated_at
    from notes
    order by updated_at desc
  `;

  return result.rows;
}

export async function getNoteById(id: string): Promise<DbNote | null> {
  const result = await sql<DbNote>`
    select id, title, content, created_at, updated_at
    from notes
    where id = ${id}
    limit 1
  `;

  return result.rows[0] ?? null;
}

export async function createNote(title: string, content: string): Promise<DbNote> {
  const result = await sql<DbNote>`
    insert into notes (title, content)
    values (${title}, ${content})
    returning id, title, content, created_at, updated_at
  `;

  return result.rows[0];
}

export async function updateNote(id: string, title: string, content: string): Promise<DbNote | null> {
  const result = await sql<DbNote>`
    update notes
    set title = ${title}, content = ${content}, updated_at = now()
    where id = ${id}
    returning id, title, content, created_at, updated_at
  `;

  return result.rows[0] ?? null;
}

export async function deleteNote(id: string): Promise<boolean> {
  const result = await sql`
    delete from notes
    where id = ${id}
  `;

  return Number(result.rowCount ?? 0) > 0;
}
