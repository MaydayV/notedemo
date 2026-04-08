import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/password';

describe('password helpers', () => {
  it('hashes and verifies password', async () => {
    const plain = '123456';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    await expect(verifyPassword(plain, hashed)).resolves.toBe(true);
    await expect(verifyPassword('wrong', hashed)).resolves.toBe(false);
  });
});
