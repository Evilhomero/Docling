'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createNote } from '@/server/actions/notes';
import { PILLARS, PLATFORMS } from '@/lib/constants';
import type { Pillar, Platform } from '@/types';

export function NoteQuickCapture() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [rawNote, setRawNote] = useState('');
  const [pillar, setPillar] = useState<Pillar | ''>('');
  const [showMore, setShowMore] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent, redirectToEdit = false) => {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      const note = await createNote({
        title: title.trim(),
        rawNote: rawNote.trim(),
        stage: 'fleeting',
        pillar: pillar || null,
        tags: [],
        platforms: [],
        connectionIds: [],
      });

      if (redirectToEdit) {
        router.push(`/notes/${note.id}`);
      } else {
        setTitle('');
        setRawNote('');
        setPillar('');
        setShowMore(false);
        titleRef.current?.focus();
      }
    });
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-3">
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titulo de la idea..."
        autoFocus
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
        disabled={isPending}
      />

      <textarea
        value={rawNote}
        onChange={(e) => setRawNote(e.target.value)}
        placeholder="Nota cruda (opcional)..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
        disabled={isPending}
      />

      {showMore && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pilar</label>
          <select
            value={pillar}
            onChange={(e) => setPillar(e.target.value as Pillar | '')}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">Sin pilar</option>
            {PILLARS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!title.trim() || isPending}
          className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isPending ? 'Guardando...' : 'Guardar como Fleeting'}
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e as any, true)}
          disabled={!title.trim() || isPending}
          className="py-2.5 px-3 border border-border text-foreground rounded-lg hover:bg-accent disabled:opacity-50 transition-colors text-sm"
          title="Guardar y editar"
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="py-2.5 px-3 border border-border text-muted-foreground rounded-lg hover:bg-accent transition-colors text-sm"
          title={showMore ? 'Menos opciones' : 'Más opciones'}
        >
          {showMore ? '−' : '+'}
        </button>
      </div>
    </form>
  );
}
