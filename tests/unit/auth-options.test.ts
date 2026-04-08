import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/db', () => ({
  getUserByUsername: vi.fn(async (username: string) =>
    username === 'admin' ? { id: 'u1', username: 'admin', password_hash: 'hash' } : null,
  ),
}));

import { findCredentialsUser } from '@/lib/auth-options';

describe('findCredentialsUser', () => {
  it('returns admin record when exists', async () => {
    const user = await findCredentialsUser('admin');
    expect(user?.username).toBe('admin');
  });
});
