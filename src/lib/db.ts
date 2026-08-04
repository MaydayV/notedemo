import mysql from 'mysql2/promise';

function getConfig() {
  // Support either full MYSQL_DSN or separate parts (avoids special-char issues in panel UIs)
  const dsn = process.env.MYSQL_DSN;
  if (dsn) {
    return { uri: dsn };
  }

  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || '123456',
    database: process.env.MYSQL_DB || 'notedemo',
    charset: 'utf8mb4',
    timezone: '+08:00',
  };
}

const pool = mysql.createPool({
  ...getConfig(),
  waitForConnections: true,
  connectionLimit: 5,
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
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(
    'SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1',
    [username],
  );

  return (rows[0] as DbUser) ?? null;
}

export { pool };
