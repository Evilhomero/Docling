import Link from 'next/link';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { getNotes, getAllTags } from '@/server/queries/notes';
import { STAGES, PILLARS, PLATFORMS } from '@/lib/constants';
import { StageBadge } from '@/components/shared/stage-badge';
import { PillarBadge } from '@/components/shared/pillar-badge';
import { PlatformIcons } from '@/components/shared/platform-icons';
import { formatRelativeTime } from '@/lib/utils';
import type { Stage, Pillar, Platform } from '@/types';

interface NotesPageProps {
  searchParams: Promise<{
    stage?: string;
    pillar?: string;
    platform?: string;
    tag?: string;
    search?: string;
    archived?: string;
  }>;
}

async function NotesContent({ searchParams }: NotesPageProps) {
  const params = await searchParams;
  const notes = await getNotes({
    stage: params.stage as Stage | undefined,
    pillar: params.pillar as Pillar | undefined,
    platform: params.platform as Platform | undefined,
    tag: params.tag,
    search: params.search,
    archived: params.archived === 'true',
  });

  const tags = await getAllTags();

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Filters */}
      <div className="space-y-3">
        {/* Stage filter */}
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/notes"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !params.stage ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Todas
          </Link>
          {STAGES.map((stage) => (
            <Link
              key={stage.id}
              href={`/notes?stage=${stage.id}`}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                params.stage === stage.id
                  ? `${stage.bgColor} ${stage.textColor} border border-current`
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {stage.emoji} {stage.label}
            </Link>
          ))}
        </div>

        {/* Pillar filter */}
        <div className="flex flex-wrap gap-1.5">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.id}
              href={`/notes?pillar=${pillar.id}${params.stage ? `&stage=${params.stage}` : ''}`}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                params.pillar === pillar.id
                  ? `${pillar.bgClass} ${pillar.textClass} border border-current`
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {pillar.icon} {pillar.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {notes.length} nota{notes.length !== 1 ? 's' : ''}
          {params.search && ` para "${params.search}"`}
        </p>
        <Link
          href="/notes/new"
          className="text-xs text-primary hover:underline"
        >
          + Nueva nota
        </Link>
      </div>

      {/* Notes list */}
      <div className="space-y-2">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-muted-foreground text-sm">No hay notas{params.search ? ` para "${params.search}"` : ''}</p>
            <Link href="/notes/new" className="mt-4 text-primary text-sm hover:underline">
              Crear primera nota
            </Link>
          </div>
        ) : (
          notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-card/80 transition-all"
            >
              <StageBadge stage={note.stage as Stage} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {note.pillar && <PillarBadge pillar={note.pillar} />}
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag.id} className="text-xs text-muted-foreground">
                      #{tag.tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <PlatformIcons platforms={note.platforms} max={3} />
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(new Date(note.updatedAt))}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default function NotesPage(props: NotesPageProps) {
  return (
    <div className="flex flex-col h-full">
      <Header title="Notas" />
      <div className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="p-4 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          }
        >
          <NotesContent searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
