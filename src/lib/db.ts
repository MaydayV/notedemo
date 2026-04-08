import { sql } from '@vercel/postgres';

export type DbUser = {
  id: string;
  username: string;
  password_hash: string;
};

export type DbNote = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export async function getUserByUsername(username: string): Promise<DbUser | null> {
  const result = await sql<DbUser>`
    select id, username, password_hash
    from users
    where username = ${username}
    limit 1
  `;

  return result.rows[0] ?? null;
}
