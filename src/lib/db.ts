import { Pool } from 'pg';

function getConnectionString(): string {
  const url = process.env.POSTGRES_URL ?? '';
  // Supabase URLs contain sslmode=require which causes pg to verify certs.
  // Replace with sslmode=no-verify to allow self-signed Supabase certs.
  return url.replace(/sslmode=require/, 'sslmode=no-verify');
}

const pool = new Pool({
  connectionString: getConnectionString(),
  ssl: { rejectUnauthorized: false },
  max: 5,
});

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
  const result = await pool.query<DbUser>(
    'SELECT id, username, password_hash FROM users WHERE username = $1 LIMIT 1',
    [username],
  );

  return result.rows[0] ?? null;
}

export { pool };
