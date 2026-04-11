export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export function validateUpload(file: File | null): 'file_required' | 'invalid_type' | 'file_too_large' | null {
  if (!file) {
    return 'file_required';
  }

  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return 'invalid_type';
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return 'file_too_large';
  }

  return null;
}

export function sanitizeFilename(name: string): string {
  const base = name.replace(/.*[\\/]/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.slice(0, 100) || 'upload';
}
