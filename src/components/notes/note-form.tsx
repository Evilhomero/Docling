'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createNote, updateNote } from '@/server/actions/notes';
import { PILLARS, PLATFORMS, SOURCE_TYPES, STAGES } from '@/lib/constants';
import type { NoteWithRelations } from '@/types';
import type { Pillar, Platform, Stage } from '@/types';

interface NoteFormProps {
  note?: NoteWithRelations;
  defaultStage?: Stage;
}

export function NoteForm({ note, defaultStage = 'fleeting' }: NoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!note;

  const [title, setTitle] = useState(note?.title ?? '');
  const [rawNote, setRawNote] = useState(note?.rawNote ?? '');
  const [processedNote, setProcessedNote] = useState(note?.processedNote ?? '');
  const [stage, setStage] = useState<Stage>(note?.stage ?? defaultStage);
  const [pillar, setPillar] = useState<Pillar | ''>(note?.pillar ?? '');
  const [sourceType, setSourceType] = useState(note?.sourceType ?? '');
  const [sourceUrl, setSourceUrl] = useState(note?.sourceUrl ?? '');
  const [productionNotes, setProductionNotes] = useState(note?.productionNotes ?? '');
  const [copyText, setCopyText] = useState(note?.copyText ?? '');
  const [tags, setTags] = useState<string[]>(note?.tags.map((t) => t.tag) ?? []);
  const [tagInput, setTagInput] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>(note?.platforms.map((p) => p.platform) ?? []);
  const [activeTab, setActiveTab] = useState<'content' | 'metadata' | 'production'>('content');

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  };

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      if (isEditing && note) {
        await updateNote({
          id: note.id,
          title: title.trim(),
          rawNote,
          processedNote,
          stage,
          pillar: pillar || null,
          sourceType: sourceType || null,
          sourceUrl: sourceUrl || null,
          productionNotes,
          copyText,
          tags,
          platforms,
        });
        router.refresh();
      } else {
        const created = await createNote({
          title: title.trim(),
          rawNote,
          stage,
          pillar: pillar || null,
          sourceType: sourceType || null,
          sourceUrl: sourceUrl || null,
          tags,
          platforms,
          connectionIds: [],
        });
        router.push(`/notes/${created.id}`);
      }
    });
  };

  const tabs = [
    { id: 'content', label: 'Contenido' },
    { id: 'metadata', label: 'Clasificación' },
    { id: 'production', label: 'Producción' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titulo de la nota..."
          autoFocus={!isEditing}
          className="w-full px-0 py-2 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-xl font-semibold border-b border-border focus:border-primary transition-colors"
          disabled={isPending}
        />
      </div>

      {/* Stage selector */}
      <div className="flex flex-wrap gap-1.5">
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStage(s.id as Stage)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              stage === s.id
                ? `${s.bgColor} ${s.textColor} border border-current`
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nota cruda</label>
            <textarea
              value={rawNote}
              onChange={(e) => setRawNote(e.target.value)}
              placeholder="Idea original sin procesar..."
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nota procesada</label>
            <textarea
              value={processedNote}
              onChange={(e) => setProcessedNote(e.target.value)}
              placeholder="Versión estructurada y procesada..."
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              disabled={isPending}
            />
          </div>
        </div>
      )}

      {/* Metadata Tab */}
      {activeTab === 'metadata' && (
        <div className="space-y-4">
          {/* Pillar */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Pilar de contenido</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPillar('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !pillar ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                Sin pilar
              </button>
              {PILLARS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPillar(p.id as Pillar)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pillar === p.id
                      ? `${p.bgClass} ${p.textClass} border border-current`
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plataformas destino</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id as Platform)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    platforms.includes(p.id as Platform)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded-md text-xs text-muted-foreground"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="hover:text-destructive transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="Agregar tag (Enter para confirmar)..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo de fuente</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">Sin fuente</option>
                {SOURCE_TYPES.map((s) => (
                  <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">URL de fuente</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Production Tab */}
      {activeTab === 'production' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notas de producción</label>
            <textarea
              value={productionNotes}
              onChange={(e) => setProductionNotes(e.target.value)}
              placeholder="Instrucciones para crear el contenido..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Copy final</label>
            <textarea
              value={copyText}
              onChange={(e) => setCopyText(e.target.value)}
              placeholder="Texto listo para publicar..."
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              disabled={isPending}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={!title.trim() || isPending}
          className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear nota'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="py-2.5 px-4 border border-border text-foreground rounded-lg hover:bg-accent transition-colors text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
