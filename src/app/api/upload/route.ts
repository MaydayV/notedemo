import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { validateUpload } from '@/lib/upload';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const value = formData.get('file');
  const file = value instanceof File ? value : null;

  const error = validateUpload(file);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const blob = await put(`notes/${Date.now()}-${file.name}`, file, { access: 'public' });
  return NextResponse.json({ url: blob.url }, { status: 201 });
}
