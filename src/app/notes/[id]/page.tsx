import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import DeleteNoteButton from '@/components/delete-note-button';
import NoteEditor from '@/components/note-editor';
import { getNoteById } from '@/lib/notes';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditNotePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    return (
      <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
        <h1>笔记不存在</h1>
        <p>
          <Link href="/notes">返回列表</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h1>编辑笔记</h1>
      <NoteEditor mode="edit" noteId={note.id} initialTitle={note.title} initialContent={note.content} />
      <DeleteNoteButton id={note.id} />
    </main>
  );
}
