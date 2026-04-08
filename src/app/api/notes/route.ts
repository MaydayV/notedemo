import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { createNote, listNotes } from '@/lib/notes';
import { noteSchema } from '@/lib/validation';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const notes = await listNotes();
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = noteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const note = await createNote(parsed.data.title, parsed.data.content);
  return NextResponse.json(note, { status: 201 });
}
