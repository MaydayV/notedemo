import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { sanitizeFilename, validateUpload } from '@/lib/upload';

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

  const safeFile = file as File;
  const safeName = sanitizeFilename(safeFile.name);
  const filename = `${Date.now()}-${safeName}`;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await safeFile.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
