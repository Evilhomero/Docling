import type { InferSelectModel } from 'drizzle-orm';
import type { notes, noteTags, notePlatforms, noteConnections, stageHistory } from '@/db/schema';

export type Note = InferSelectModel<typeof notes>;
export type NoteTag = InferSelectModel<typeof noteTags>;
export type NotePlatform = InferSelectModel<typeof notePlatforms>;
export type NoteConnection = InferSelectModel<typeof noteConnections>;
export type StageHistory = InferSelectModel<typeof stageHistory>;

export type Stage = Note['stage'];
export type Pillar = NonNullable<Note['pillar']>;
export type Platform = NotePlatform['platform'];

export type NoteWithRelations = Note & {
  tags: NoteTag[];
  platforms: NotePlatform[];
  connectionsFrom: (NoteConnection & { targetNote: Note })[];
  connectionsTo: (NoteConnection & { sourceNote: Note })[];
  stageHistory: StageHistory[];
};

export type NoteSummary = Pick<Note, 'id' | 'title' | 'stage' | 'pillar' | 'createdAt' | 'updatedAt' | 'archived' | 'scheduledDate'> & {
  tags: NoteTag[];
  platforms: NotePlatform[];
};

export type StageStats = {
  stage: Stage;
  count: number;
};

export type PillarStats = {
  pillar: Pillar | null;
  count: number;
};

export type DashboardStats = {
  totalNotes: number;
  byStage: StageStats[];
  byPillar: PillarStats[];
  recentActivity: NoteWithRelations[];
  upcomingPublications: NoteSummary[];
};
