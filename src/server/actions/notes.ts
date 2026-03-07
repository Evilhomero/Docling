'use server';

import { db } from '@/db';
import { notes, noteTags, notePlatforms, noteConnections, stageHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { createNoteSchema, updateNoteSchema, stageValues } from '@/lib/validators';
import type { CreateNoteInput, UpdateNoteInput } from '@/lib/validators';

export async function createNote(input: CreateNoteInput) {
  const data = createNoteSchema.parse(input);

  const [note] = await db.insert(notes).values({
    title: data.title,
    rawNote: data.rawNote,
    stage: data.stage,
    pillar: data.pillar ?? null,
    sourceType: data.sourceType ?? null,
    sourceUrl: data.sourceUrl || null,
  }).returning();

  if (data.tags.length > 0) {
    await db.insert(noteTags).values(
      data.tags.map((tag) => ({ noteId: note.id, tag }))
    );
  }

  if (data.platforms.length > 0) {
    await db.insert(notePlatforms).values(
      data.platforms.map((platform) => ({ noteId: note.id, platform }))
    );
  }

  if (data.connectionIds.length > 0) {
    await db.insert(noteConnections).values(
      data.connectionIds.map((targetId) => ({
        sourceNoteId: note.id,
        targetNoteId: targetId,
        connectionType: 'related',
      }))
    );
  }

  await db.insert(stageHistory).values({
    noteId: note.id,
    toStage: data.stage,
  });

  revalidatePath('/pipeline');
  revalidatePath('/notes');
  revalidatePath('/dashboard');

  return note;
}

export async function updateNote(input: UpdateNoteInput) {
  const data = updateNoteSchema.parse(input);
  const { id, tags, platforms, connectionIds, ...noteData } = data;

  const updatePayload: Record<string, unknown> = {
    ...noteData,
    updatedAt: new Date(),
    sourceUrl: noteData.sourceUrl || null,
    publishedUrl: noteData.publishedUrl || null,
    scheduledDate: noteData.scheduledDate ? new Date(noteData.scheduledDate) : undefined,
    publishedDate: noteData.publishedDate ? new Date(noteData.publishedDate) : undefined,
  };

  Object.keys(updatePayload).forEach((key) => {
    if (updatePayload[key] === undefined) delete updatePayload[key];
  });

  await db.update(notes).set(updatePayload).where(eq(notes.id, id));

  if (tags !== undefined) {
    await db.delete(noteTags).where(eq(noteTags.noteId, id));
    if (tags.length > 0) {
      await db.insert(noteTags).values(tags.map((tag) => ({ noteId: id, tag })));
    }
  }

  if (platforms !== undefined) {
    await db.delete(notePlatforms).where(eq(notePlatforms.noteId, id));
    if (platforms.length > 0) {
      await db.insert(notePlatforms).values(platforms.map((platform) => ({ noteId: id, platform })));
    }
  }

  revalidatePath('/pipeline');
  revalidatePath('/notes');
  revalidatePath(`/notes/${id}`);

  return { success: true };
}

export async function advanceStage(noteId: string) {
  const [note] = await db.select().from(notes).where(eq(notes.id, noteId));
  if (!note) throw new Error('Note not found');

  const currentIdx = stageValues.indexOf(note.stage);
  if (currentIdx >= stageValues.length - 1) throw new Error('Already at final stage');

  const nextStage = stageValues[currentIdx + 1];

  await db.update(notes).set({ stage: nextStage, updatedAt: new Date() }).where(eq(notes.id, noteId));

  await db.insert(stageHistory).values({
    noteId,
    fromStage: note.stage,
    toStage: nextStage,
  });

  revalidatePath('/pipeline');
  revalidatePath('/notes');
  revalidatePath('/dashboard');

  return { newStage: nextStage };
}

export async function regressStage(noteId: string) {
  const [note] = await db.select().from(notes).where(eq(notes.id, noteId));
  if (!note) throw new Error('Note not found');

  const currentIdx = stageValues.indexOf(note.stage);
  if (currentIdx <= 0) throw new Error('Already at first stage');

  const prevStage = stageValues[currentIdx - 1];

  await db.update(notes).set({ stage: prevStage, updatedAt: new Date() }).where(eq(notes.id, noteId));

  await db.insert(stageHistory).values({
    noteId,
    fromStage: note.stage,
    toStage: prevStage,
  });

  revalidatePath('/pipeline');
  revalidatePath('/notes');

  return { newStage: prevStage };
}

export async function moveNoteToStage(noteId: string, targetStage: typeof stageValues[number]) {
  const [note] = await db.select().from(notes).where(eq(notes.id, noteId));
  if (!note) throw new Error('Note not found');

  if (note.stage === targetStage) return { newStage: targetStage };

  await db.update(notes).set({ stage: targetStage, updatedAt: new Date() }).where(eq(notes.id, noteId));

  await db.insert(stageHistory).values({
    noteId,
    fromStage: note.stage,
    toStage: targetStage,
  });

  revalidatePath('/pipeline');
  revalidatePath('/notes');
  revalidatePath('/dashboard');

  return { newStage: targetStage };
}

export async function deleteNote(noteId: string) {
  await db.delete(notes).where(eq(notes.id, noteId));
  revalidatePath('/pipeline');
  revalidatePath('/notes');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function archiveNote(noteId: string) {
  await db.update(notes).set({ archived: true, updatedAt: new Date() }).where(eq(notes.id, noteId));
  revalidatePath('/pipeline');
  revalidatePath('/notes');
  return { success: true };
}

export async function unarchiveNote(noteId: string) {
  await db.update(notes).set({ archived: false, updatedAt: new Date() }).where(eq(notes.id, noteId));
  revalidatePath('/notes');
  return { success: true };
}

export async function addConnection(
  sourceNoteId: string,
  targetNoteId: string,
  connectionType: string = 'related',
  note: string = ''
) {
  await db.insert(noteConnections).values({
    sourceNoteId,
    targetNoteId,
    connectionType,
    note,
  });
  revalidatePath(`/notes/${sourceNoteId}`);
  revalidatePath('/graph');
  return { success: true };
}

export async function removeConnection(connectionId: string) {
  await db.delete(noteConnections).where(eq(noteConnections.id, connectionId));
  revalidatePath('/graph');
  return { success: true };
}
