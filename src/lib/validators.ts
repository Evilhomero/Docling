import { z } from 'zod';

export const stageValues = ['fleeting', 'literature', 'permanent', 'production', 'scheduled', 'published'] as const;
export const pillarValues = ['aeropuerto', 'bodas', 'tours', 'corporativo', 'confianza', 'educacion'] as const;
export const platformValues = [
  'instagram_carousel', 'instagram_reel', 'instagram_story',
  'facebook_info', 'facebook_post', 'youtube', 'tiktok', 'whatsapp_status',
] as const;

export const createNoteSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(500),
  rawNote: z.string().default(''),
  stage: z.enum(stageValues).default('fleeting'),
  pillar: z.enum(pillarValues).nullable().optional(),
  sourceType: z.string().max(50).nullable().optional(),
  sourceUrl: z.string().url('URL inválida').nullable().optional().or(z.literal('')),
  tags: z.array(z.string().max(100)).default([]),
  platforms: z.array(z.enum(platformValues)).default([]),
  connectionIds: z.array(z.string().uuid()).default([]),
});

export const updateNoteSchema = createNoteSchema.partial().extend({
  id: z.string().uuid(),
  processedNote: z.string().optional(),
  productionNotes: z.string().optional(),
  copyText: z.string().optional(),
  scheduledDate: z.string().datetime().nullable().optional(),
  publishedDate: z.string().datetime().nullable().optional(),
  publishedUrl: z.string().url('URL inválida').nullable().optional().or(z.literal('')),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
