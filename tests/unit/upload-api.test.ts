import { describe, it, expect } from 'vitest';
import { MAX_UPLOAD_SIZE, validateUpload } from '@/lib/upload';

describe('upload validation', () => {
  it('rejects non-image files', () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'demo.pdf', { type: 'application/pdf' });
    expect(validateUpload(file)).toBe('invalid_type');
  });

  it('rejects files larger than 5MB', () => {
    const tooLarge = new File([new Uint8Array(MAX_UPLOAD_SIZE + 1)], 'big.png', { type: 'image/png' });
    expect(validateUpload(tooLarge)).toBe('file_too_large');
  });

  it('accepts valid image files', () => {
    const ok = new File([new Uint8Array([1, 2, 3])], 'ok.png', { type: 'image/png' });
    expect(validateUpload(ok)).toBeNull();
  });
});
