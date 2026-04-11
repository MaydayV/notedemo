import { pool } from '@/lib/db';
import type { DbNote } from '@/lib/db';

export async function listNotes(): Promise<DbNote[]> {
  const result = await pool.query<DbNote>(
    'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC',
  );

  return result.rows;
}

export async function getNoteById(id: string): Promise<DbNote | null> {
  const result = await pool.query<DbNote>(
    'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = $1 LIMIT 1',
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createNote(title: string, content: string): Promise<DbNote> {
  const result = await pool.query<DbNote>(
    'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING id, title, content, created_at, updated_at',
    [title, content],
  );

  return result.rows[0];
}

export async function updateNote(id: string, title: string, content: string): Promise<DbNote | null> {
  const result = await pool.query<DbNote>(
    'UPDATE notes SET title = $1, content = $2, updated_at = now() WHERE id = $3 RETURNING id, title, content, created_at, updated_at',
    [title, content, id],
  );

  return result.rows[0] ?? null;
}

export async function deleteNote(id: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM notes WHERE id = $1',
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}
