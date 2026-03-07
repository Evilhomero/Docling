'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NoteCard } from '@/components/notes/note-card';
import { cn } from '@/lib/utils';
import type { NoteSummary, Stage } from '@/types';

interface KanbanColumnProps {
  stage: {
    id: string;
    label: string;
    emoji: string;
    color: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    description: string;
  };
  notes: NoteSummary[];
}

function SortableNoteCard({ note }: { note: NoteSummary }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: note.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(isDragging && 'opacity-50')}
    >
      <NoteCard note={note} compact />
    </div>
  );
}

export function KanbanColumn({ stage, notes }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: stage.id });

  return (
    <div className="flex flex-col w-60 shrink-0">
      <div className={cn('flex items-center gap-2 px-2 py-2 mb-2 rounded-lg', stage.bgColor)}>
        <span className="text-base">{stage.emoji}</span>
        <span className={cn('text-xs font-semibold flex-1', stage.textColor)}>{stage.label}</span>
        <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', stage.bgColor, stage.textColor)}>
          {notes.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 rounded-xl p-2 min-h-[200px] transition-colors kanban-column',
          isOver ? 'bg-primary/5 border border-primary/30' : 'bg-muted/20'
        )}
      >
        <SortableContext items={notes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          {notes.map((note) => (
            <SortableNoteCard key={note.id} note={note} />
          ))}
        </SortableContext>

        {notes.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/50">
            Suelta aquí
          </div>
        )}
      </div>
    </div>
  );
}
