import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { hashPassword } from '../src/lib/password';

function newUUID(): string {
  const b = crypto.randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || '123456',
    database: process.env.MYSQL_DB || 'notedemo',
    charset: 'utf8mb4',
  });

  const hash = await hashPassword('123456');

  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    ['admin'],
  );

  if (rows.length === 0) {
    await connection.execute(
      'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
      [newUUID(), 'admin', hash],
    );
    console.log('admin user created (admin/123456)');
  } else {
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [hash, 'admin'],
    );
    console.log('admin password reset');
  }

  await connection.end();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
