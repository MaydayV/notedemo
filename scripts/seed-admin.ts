import { sql } from '@vercel/postgres';
import { hashPassword } from '../src/lib/password';

async function main() {
  const hash = await hashPassword('123456');

  await sql`
    insert into users (username, password_hash)
    values ('admin', ${hash})
    on conflict (username)
    do update set password_hash = excluded.password_hash
  `;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
