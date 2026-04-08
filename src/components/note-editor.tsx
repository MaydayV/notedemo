'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function insertImageMarkdown(alt: string, url: string) {
  return `![${alt}](${url})`;
}

type NoteEditorProps = {
  mode: 'create' | 'edit';
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
};

export default function NoteEditor({
  mode,
  noteId,
  initialTitle = '',
  initialContent = '',
}: NoteEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function onUpload(file: File) {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      setError('上传失败');
      return;
    }

    const data = (await res.json()) as { url: string };
    setContent((prev) => `${prev}${prev.endsWith('\n') || prev.length === 0 ? '' : '\n'}${insertImageMarkdown(file.name, data.url)}\n`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const endpoint = mode === 'create' ? '/api/notes' : `/api/notes/${noteId}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    setSaving(false);

    if (!res.ok) {
      setError('保存失败');
      return;
    }

    router.push('/notes');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
      <input
        placeholder="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        rows={20}
        placeholder="Markdown 内容"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            void onUpload(file);
          }
        }}
      />
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <button type="submit" disabled={saving}>
        {saving ? '保存中…' : '保存'}
      </button>
    </form>
  );
}
