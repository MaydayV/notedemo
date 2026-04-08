import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcryptjs';

vi.mock('@/lib/db', () => ({
  getUserByUsername: vi.fn(async (username: string) =>
    username === 'admin' ? { id: 'u1', username: 'admin', password_hash: await bcrypt.hash('123456', 10) } : null,
  ),
}));

import { findCredentialsUser, verifyCredentials } from '@/lib/auth-options';

describe('findCredentialsUser', () => {
  it('returns admin record when exists', async () => {
    const user = await findCredentialsUser('admin');
    expect(user?.username).toBe('admin');
  });
});

describe('verifyCredentials', () => {
  it('rejects wrong password', async () => {
    const user = await verifyCredentials('admin', 'bad');
    expect(user).toBeNull();
  });

  it('accepts correct password', async () => {
    const user = await verifyCredentials('admin', '123456');
    expect(user?.name).toBe('admin');
  });
});
