export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export function validateUpload(file: File | null): 'file_required' | 'invalid_type' | 'file_too_large' | null {
  if (!file) {
    return 'file_required';
  }

  if (!file.type.startsWith('image/')) {
    return 'invalid_type';
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return 'file_too_large';
  }

  return null;
}
