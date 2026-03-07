import Link from 'next/link';
import { formatRelativeTime, cn } from '@/lib/utils';
import { StageBadge } from '@/components/shared/stage-badge';
import { PillarBadge } from '@/components/shared/pillar-badge';
import { PlatformIcons } from '@/components/shared/platform-icons';
import type { NoteSummary } from '@/types';

interface NoteCardProps {
  note: NoteSummary;
  className?: string;
  compact?: boolean;
}

export function NoteCard({ note, className, compact = false }: NoteCardProps) {
  return (
    <Link href={`/notes/${note.id}`}>
      <div
        className={cn(
          'group bg-card border border-border rounded-lg p-3 hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer',
          className
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors">
            {note.title}
          </h3>
        </div>

        {!compact && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {note.pillar && <PillarBadge pillar={note.pillar} />}
            {note.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground"
              >
                #{tag.tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{note.tags.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <PlatformIcons platforms={note.platforms} max={3} />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(new Date(note.updatedAt))}
          </span>
        </div>

        {note.scheduledDate && (
          <div className="mt-1.5 text-xs text-indigo-400">
            📅 {new Date(note.scheduledDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
          </div>
        )}
      </div>
    </Link>
  );
}
