import {
  pgTable, uuid, text, varchar, timestamp, boolean,
  pgEnum, jsonb, index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const stageEnum = pgEnum('stage', [
  'fleeting',
  'literature',
  'permanent',
  'production',
  'scheduled',
  'published',
]);

export const pillarEnum = pgEnum('pillar', [
  'aeropuerto',
  'bodas',
  'tours',
  'corporativo',
  'confianza',
  'educacion',
]);

export const platformEnum = pgEnum('platform', [
  'instagram_carousel',
  'instagram_reel',
  'instagram_story',
  'facebook_info',
  'facebook_post',
  'youtube',
  'tiktok',
  'whatsapp_status',
]);

// Tables
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  rawNote: text('raw_note').notNull().default(''),
  processedNote: text('processed_note').default(''),
  stage: stageEnum('stage').notNull().default('fleeting'),
  pillar: pillarEnum('pillar'),
  sourceType: varchar('source_type', { length: 50 }),
  sourceUrl: text('source_url'),
  productionNotes: text('production_notes').default(''),
  copyText: text('copy_text').default(''),
  mediaUrls: jsonb('media_urls').$type<string[]>().default([]),
  scheduledDate: timestamp('scheduled_date'),
  publishedDate: timestamp('published_date'),
  publishedUrl: text('published_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archived: boolean('archived').default(false),
}, (table) => [
  index('notes_stage_idx').on(table.stage),
  index('notes_pillar_idx').on(table.pillar),
  index('notes_created_idx').on(table.createdAt),
  index('notes_scheduled_idx').on(table.scheduledDate),
]);

export const noteTags = pgTable('note_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  tag: varchar('tag', { length: 100 }).notNull(),
}, (table) => [
  index('note_tags_note_idx').on(table.noteId),
  index('note_tags_tag_idx').on(table.tag),
]);

export const notePlatforms = pgTable('note_platforms', {
  id: uuid('id').defaultRandom().primaryKey(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  platform: platformEnum('platform').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  platformNotes: text('platform_notes').default(''),
  publishedUrl: text('published_url'),
});

export const noteConnections = pgTable('note_connections', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceNoteId: uuid('source_note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  targetNoteId: uuid('target_note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  connectionType: varchar('connection_type', { length: 50 }).default('related'),
  note: text('note').default(''),
});

export const stageHistory = pgTable('stage_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  fromStage: stageEnum('from_stage'),
  toStage: stageEnum('to_stage').notNull(),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
});

// Relations
export const notesRelations = relations(notes, ({ many }) => ({
  tags: many(noteTags),
  platforms: many(notePlatforms),
  connectionsFrom: many(noteConnections, { relationName: 'source' }),
  connectionsTo: many(noteConnections, { relationName: 'target' }),
  stageHistory: many(stageHistory),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, { fields: [noteTags.noteId], references: [notes.id] }),
}));

export const notePlatformsRelations = relations(notePlatforms, ({ one }) => ({
  note: one(notes, { fields: [notePlatforms.noteId], references: [notes.id] }),
}));

export const noteConnectionsRelations = relations(noteConnections, ({ one }) => ({
  sourceNote: one(notes, { fields: [noteConnections.sourceNoteId], references: [notes.id], relationName: 'source' }),
  targetNote: one(notes, { fields: [noteConnections.targetNoteId], references: [notes.id], relationName: 'target' }),
}));

export const stageHistoryRelations = relations(stageHistory, ({ one }) => ({
  note: one(notes, { fields: [stageHistory.noteId], references: [notes.id] }),
}));
