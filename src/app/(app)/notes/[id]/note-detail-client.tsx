'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  advanceStage, regressStage, deleteNote, archiveNote, updateNote
} from '@/server/actions/notes';
import { NoteForm } from '@/components/notes/note-form';
import { StageBadge } from '@/components/shared/stage-badge';
import { PillarBadge } from '@/components/shared/pillar-badge';
import { PlatformIcons } from '@/components/shared/platform-icons';
import { STAGES, CONNECTION_TYPES } from '@/lib/constants';
import { formatDate, formatRelativeTime, getStage, cn } from '@/lib/utils';
import type { NoteWithRelations, Stage } from '@/types';

interface NoteDetailClientProps {
  note: NoteWithRelations;
}

export function NoteDetailClient({ note }: NoteDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'production' | 'connections' | 'history'>('content');

  const stageIdx = STAGES.findIndex((s) => s.id === note.stage);
  const canAdvance = stageIdx < STAGES.length - 1;
  const canRegress = stageIdx > 0;

  const handleAdvance = () => {
    startTransition(async () => {
      await advanceStage(note.id);
      router.refresh();
    });
  };

  const handleRegress = () => {
    startTransition(async () => {
      await regressStage(note.id);
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteNote(note.id);
      router.push('/notes');
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archiveNote(note.id);
      router.push('/notes');
    });
  };

  if (isEditing) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <button
          onClick={() => setIsEditing(false)}
          className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
        >
          ← Cancelar edición
        </button>
        <NoteForm note={note} />
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: 'Contenido' },
    { id: 'production', label: 'Producción' },
    { id: 'connections', label: `Conexiones (${note.connectionsFrom.length + note.connectionsTo.length})` },
    { id: 'history', label: 'Historial' },
  ] as const;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/notes" className="hover:text-foreground transition-colors">Notas</Link>
        <span>/</span>
        <span className="text-foreground truncate">{note.title}</span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-xl font-bold text-foreground leading-tight">{note.title}</h1>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Editar
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                ...
              </button>
              {showDeleteConfirm && (
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg p-2 min-w-32 z-10 shadow-lg">
                  <button
                    onClick={handleArchive}
                    disabled={isPending}
                    className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors"
                  >
                    Archivar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="w-full text-left px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <StageBadge stage={note.stage as Stage} />
          {note.pillar && <PillarBadge pillar={note.pillar} />}
          <PlatformIcons platforms={note.platforms} />
          {note.tags.map((tag) => (
            <span key={tag.id} className="text-xs px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
              #{tag.tag}
            </span>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatRelativeTime(new Date(note.updatedAt))}
          </span>
        </div>

        {/* Stage navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STAGES.map((s, idx) => {
            const isCurrent = s.id === note.stage;
            const isPast = idx < stageIdx;
            return (
              <div key={s.id} className="flex items-center gap-1 shrink-0">
                <div
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium transition-colors',
                    isCurrent ? `${s.bgColor} ${s.textColor} border border-current` :
                    isPast ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground/50'
                  )}
                >
                  {s.emoji} {s.label}
                </div>
                {idx < STAGES.length - 1 && (
                  <span className="text-muted-foreground/30">→</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Stage actions */}
        <div className="flex gap-2 mt-3">
          {canRegress && (
            <button
              onClick={handleRegress}
              disabled={isPending}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
            >
              ← Retroceder
            </button>
          )}
          {canAdvance && (
            <button
              onClick={handleAdvance}
              disabled={isPending}
              className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Avanzar → {getStage(STAGES[stageIdx + 1]?.id)?.label}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="border-b border-border flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content tab */}
        {activeTab === 'content' && (
          <div className="py-4 space-y-4">
            {note.rawNote && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">Nota cruda</h3>
                <div className="p-3 rounded-xl bg-muted/20 text-sm text-foreground whitespace-pre-wrap">
                  {note.rawNote}
                </div>
              </div>
            )}
            {note.processedNote && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">Nota procesada</h3>
                <div className="p-3 rounded-xl bg-muted/20 text-sm text-foreground whitespace-pre-wrap">
                  {note.processedNote}
                </div>
              </div>
            )}
            {note.sourceType && (
              <div className="text-sm text-muted-foreground">
                Fuente: <span className="text-foreground">{note.sourceType}</span>
                {note.sourceUrl && (
                  <a href={note.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline text-xs">
                    Ver fuente →
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Production tab */}
        {activeTab === 'production' && (
          <div className="py-4 space-y-4">
            {note.productionNotes && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">Notas de producción</h3>
                <div className="p-3 rounded-xl bg-muted/20 text-sm text-foreground whitespace-pre-wrap">
                  {note.productionNotes}
                </div>
              </div>
            )}
            {note.copyText && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">Copy final</h3>
                <div className="p-3 rounded-xl bg-muted/20 text-sm text-foreground whitespace-pre-wrap font-mono">
                  {note.copyText}
                </div>
              </div>
            )}
            {note.scheduledDate && (
              <div className="text-sm">
                <span className="text-muted-foreground">Programado: </span>
                <span className="text-indigo-400">{formatDate(note.scheduledDate)}</span>
              </div>
            )}
            {note.publishedDate && (
              <div className="text-sm">
                <span className="text-muted-foreground">Publicado: </span>
                <span className="text-green-400">{formatDate(note.publishedDate)}</span>
              </div>
            )}
            {note.publishedUrl && (
              <a href={note.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                Ver publicación →
              </a>
            )}
          </div>
        )}

        {/* Connections tab */}
        {activeTab === 'connections' && (
          <div className="py-4 space-y-3">
            {note.connectionsFrom.length === 0 && note.connectionsTo.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sin conexiones. <button onClick={() => setIsEditing(true)} className="text-primary hover:underline">Editar nota para agregar.</button>
              </p>
            ) : (
              <>
                {note.connectionsFrom.map((conn) => {
                  const connType = CONNECTION_TYPES.find((c) => c.id === conn.connectionType);
                  return (
                    <Link
                      key={conn.id}
                      href={`/notes/${conn.targetNoteId}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <span title={connType?.description}>{connType?.emoji ?? '🔗'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conn.targetNote.title}</p>
                        <p className="text-xs text-muted-foreground">{connType?.label}</p>
                      </div>
                    </Link>
                  );
                })}
                {note.connectionsTo.map((conn) => {
                  const connType = CONNECTION_TYPES.find((c) => c.id === conn.connectionType);
                  return (
                    <Link
                      key={conn.id}
                      href={`/notes/${conn.sourceNoteId}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 opacity-75 hover:border-primary/50 transition-colors"
                    >
                      <span>← {connType?.emoji ?? '🔗'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conn.sourceNote.title}</p>
                        <p className="text-xs text-muted-foreground">Enlazado desde</p>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div className="py-4 space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 text-sm">
              <span className="text-muted-foreground shrink-0">Creado</span>
              <span className="text-foreground">{formatDate(note.createdAt)}</span>
            </div>
            {note.stageHistory.map((h) => {
              const toStageData = getStage(h.toStage);
              const fromStageData = h.fromStage ? getStage(h.fromStage) : null;
              return (
                <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/10 text-sm">
                  <span className="text-muted-foreground shrink-0">{formatRelativeTime(new Date(h.changedAt))}</span>
                  <div className="flex items-center gap-1 text-xs">
                    {fromStageData && (
                      <>
                        <span className={fromStageData.textColor}>{fromStageData.emoji} {fromStageData.label}</span>
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    {toStageData && (
                      <span className={toStageData.textColor}>{toStageData.emoji} {toStageData.label}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
