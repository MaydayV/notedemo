import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { listNotes } from '@/lib/notes';

export default async function NotesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const notes = await listNotes();

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h1>我的笔记</h1>
      <p>
        <Link href="/notes/new">+ 新建笔记</Link>
      </p>
      <ul style={{ display: 'grid', gap: 10, padding: 0, listStyle: 'none' }}>
        {notes.map((note) => (
          <li key={note.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <Link href={`/notes/${note.id}`}>{note.title}</Link>
            <p style={{ margin: '8px 0 0', color: '#666' }}>
              更新于 {new Date(note.updated_at).toLocaleString('zh-CN')}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
