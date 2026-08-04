import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { pool } from '@/lib/db';
import type { DbNote } from '@/lib/db';

function newUUID(): string {
  const b = crypto.randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

export async function listNotes(): Promise<DbNote[]> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC',
  );

  return rows as DbNote[];
}

export async function getNoteById(id: string): Promise<DbNote | null> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ? LIMIT 1',
    [id],
  );

  return (rows[0] as DbNote) ?? null;
}

export async function createNote(title: string, content: string): Promise<DbNote> {
  const id = newUUID();
  await pool.execute(
    'INSERT INTO notes (id, title, content) VALUES (?, ?, ?)',
    [id, title, content],
  );

  const note = await getNoteById(id);
  return note!;
}

export async function updateNote(id: string, title: string, content: string): Promise<DbNote | null> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    'UPDATE notes SET title = ?, content = ? WHERE id = ?',
    [title, content, id],
  );

  if (result.affectedRows === 0) return null;
  return getNoteById(id);
}

export async function deleteNote(id: string): Promise<boolean> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    'DELETE FROM notes WHERE id = ?',
    [id],
  );

  return result.affectedRows > 0;
}
