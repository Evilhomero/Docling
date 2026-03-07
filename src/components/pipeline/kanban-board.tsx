'use client';

import { useState, useTransition } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { NoteCard } from '@/components/notes/note-card';
import { moveNoteToStage } from '@/server/actions/notes';
import { STAGES } from '@/lib/constants';
import type { NoteSummary, Stage } from '@/types';

interface KanbanBoardProps {
  notesByStage: Record<Stage, NoteSummary[]>;
}

export function KanbanBoard({ notesByStage: initialNotesByStage }: KanbanBoardProps) {
  const [notesByStage, setNotesByStage] = useState(initialNotesByStage);
  const [activeNote, setActiveNote] = useState<NoteSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const note = Object.values(notesByStage).flat().find((n) => n.id === active.id);
    setActiveNote(note ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveNote(null);

    if (!over) return;

    const noteId = active.id as string;
    const targetStage = over.id as Stage;

    if (!STAGES.map((s) => s.id).includes(targetStage as any)) return;

    // Find the note's current stage
    const currentStage = Object.entries(notesByStage).find(([, notes]) =>
      notes.some((n) => n.id === noteId)
    )?.[0] as Stage | undefined;

    if (!currentStage || currentStage === targetStage) return;

    // Optimistic update
    const note = notesByStage[currentStage].find((n) => n.id === noteId)!;
    setNotesByStage((prev) => ({
      ...prev,
      [currentStage]: prev[currentStage].filter((n) => n.id !== noteId),
      [targetStage]: [{ ...note, stage: targetStage }, ...prev[targetStage]],
    }));

    startTransition(async () => {
      try {
        await moveNoteToStage(noteId, targetStage);
      } catch {
        // Revert on error
        setNotesByStage((prev) => ({
          ...prev,
          [targetStage]: prev[targetStage].filter((n) => n.id !== noteId),
          [currentStage]: [note, ...prev[currentStage]],
        }));
      }
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 h-full overflow-x-auto pb-4 px-1">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            notes={notesByStage[stage.id as Stage] ?? []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeNote && (
          <div className="rotate-2 opacity-90 w-60">
            <NoteCard note={activeNote} compact />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
