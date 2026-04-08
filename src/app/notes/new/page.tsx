import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import NoteEditor from '@/components/note-editor';

export default async function NewNotePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h1>新建笔记</h1>
      <NoteEditor mode="create" />
    </main>
  );
}
