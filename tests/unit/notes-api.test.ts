import { describe, it, expect } from 'vitest';
import { noteSchema } from '@/lib/validation';

describe('notes validation', () => {
  it('rejects empty payload', () => {
    const parsed = noteSchema.safeParse({ title: '', content: '' });
    expect(parsed.success).toBe(false);
  });

  it('accepts valid payload', () => {
    const parsed = noteSchema.safeParse({ title: 'hello', content: '# world' });
    expect(parsed.success).toBe(true);
  });
});
