import { describe, it, expect } from 'vitest';
import { insertImageMarkdown } from '@/components/note-editor';

describe('insertImageMarkdown', () => {
  it('formats image markdown', () => {
    expect(insertImageMarkdown('cover', 'https://x.test/a.png')).toBe('![cover](https://x.test/a.png)');
  });
});
