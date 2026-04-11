'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteNoteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm('确定要删除这条笔记吗？')) return;
    setLoading(true);
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    setLoading(false);

    if (!res.ok) {
      return;
    }

    router.push('/notes');
    router.refresh();
  }

  return (
    <button type="button" onClick={onDelete} disabled={loading} style={{ marginTop: 12, color: 'crimson' }}>
      {loading ? '删除中…' : '删除'}
    </button>
  );
}
