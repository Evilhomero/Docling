import { db } from '@/db';
import { notes, noteTags, notePlatforms, noteConnections, stageHistory } from '@/db/schema';
import { eq, desc, and, isNull, or, ilike, inArray, sql } from 'drizzle-orm';
import type { Stage, Pillar, Platform, NoteSummary, NoteWithRelations } from '@/types';

export type NoteFilters = {
  stage?: Stage;
  pillar?: Pillar;
  platform?: Platform;
  tag?: string;
  archived?: boolean;
  search?: string;
};

export async function getNotes(filters: NoteFilters = {}): Promise<NoteSummary[]> {
  const conditions = [];

  if (filters.archived !== undefined) {
    conditions.push(eq(notes.archived, filters.archived));
  } else {
    conditions.push(eq(notes.archived, false));
  }

  if (filters.stage) {
    conditions.push(eq(notes.stage, filters.stage));
  }

  if (filters.pillar) {
    conditions.push(eq(notes.pillar, filters.pillar));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(notes.title, `%${filters.search}%`),
        ilike(notes.rawNote, `%${filters.search}%`),
        ilike(notes.processedNote, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db.query.notes.findMany({
    where: whereClause,
    orderBy: [desc(notes.updatedAt)],
    with: {
      tags: true,
      platforms: true,
    },
  });

  // Filter by platform or tag if needed (post-query)
  let filtered = result;

  if (filters.platform) {
    filtered = filtered.filter((n) =>
      n.platforms.some((p) => p.platform === filters.platform)
    );
  }

  if (filters.tag) {
    filtered = filtered.filter((n) =>
      n.tags.some((t) => t.tag === filters.tag)
    );
  }

  return filtered as NoteSummary[];
}

export async function getNoteById(id: string): Promise<NoteWithRelations | null> {
  const result = await db.query.notes.findFirst({
    where: eq(notes.id, id),
    with: {
      tags: true,
      platforms: true,
      connectionsFrom: {
        with: {
          targetNote: true,
        },
      },
      connectionsTo: {
        with: {
          sourceNote: true,
        },
      },
      stageHistory: {
        orderBy: [desc(stageHistory.changedAt)],
      },
    },
  });

  return result as NoteWithRelations | null;
}

export async function getNotesByStage(stage: Stage): Promise<NoteSummary[]> {
  const result = await db.query.notes.findMany({
    where: and(
      eq(notes.stage, stage),
      eq(notes.archived, false)
    ),
    orderBy: [desc(notes.updatedAt)],
    with: {
      tags: true,
      platforms: true,
    },
  });

  return result as NoteSummary[];
}

export async function getScheduledNotes(): Promise<NoteSummary[]> {
  const result = await db.query.notes.findMany({
    where: and(
      inArray(notes.stage, ['scheduled', 'published']),
      eq(notes.archived, false)
    ),
    orderBy: [notes.scheduledDate, desc(notes.updatedAt)],
    with: {
      tags: true,
      platforms: true,
    },
  });

  return result as NoteSummary[];
}

export async function searchNotes(query: string): Promise<NoteSummary[]> {
  const result = await db.query.notes.findMany({
    where: and(
      eq(notes.archived, false),
      or(
        ilike(notes.title, `%${query}%`),
        ilike(notes.rawNote, `%${query}%`),
        ilike(notes.processedNote, `%${query}%`)
      )
    ),
    orderBy: [desc(notes.updatedAt)],
    limit: 20,
    with: {
      tags: true,
      platforms: true,
    },
  });

  return result as NoteSummary[];
}

export async function getAllTags(): Promise<string[]> {
  const result = await db
    .selectDistinct({ tag: noteTags.tag })
    .from(noteTags)
    .orderBy(noteTags.tag);

  return result.map((r) => r.tag);
}

export async function getAllNoteConnections() {
  const allNotes = await db.query.notes.findMany({
    where: eq(notes.archived, false),
    with: {
      tags: true,
      platforms: true,
    },
  });

  const allConnections = await db.select().from(noteConnections);

  return { nodes: allNotes, edges: allConnections };
}
