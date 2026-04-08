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
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        return verifyCredentials(credentials.username, credentials.password);
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
};
