import { db } from '@/db';
import { notes } from '@/db/schema';
import { eq, count, and, gte, lte, desc } from 'drizzle-orm';
import type { Stage, Pillar, DashboardStats } from '@/types';
import { stageValues } from '@/lib/validators';

export async function getStageStats(): Promise<{ stage: Stage; count: number }[]> {
  const result = await db
    .select({ stage: notes.stage, count: count() })
    .from(notes)
    .where(eq(notes.archived, false))
    .groupBy(notes.stage);

  return stageValues.map((stage) => ({
    stage,
    count: result.find((r) => r.stage === stage)?.count ?? 0,
  }));
}

export async function getPillarStats(): Promise<{ pillar: Pillar | null; count: number }[]> {
  const result = await db
    .select({ pillar: notes.pillar, count: count() })
    .from(notes)
    .where(eq(notes.archived, false))
    .groupBy(notes.pillar);

  return result.map((r) => ({
    pillar: r.pillar as Pillar | null,
    count: r.count,
  }));
}

export async function getRecentActivity(limit: number = 10) {
  return db.query.notes.findMany({
    where: eq(notes.archived, false),
    orderBy: [desc(notes.updatedAt)],
    limit,
    with: {
      tags: true,
      platforms: true,
      stageHistory: {
        orderBy: [desc(notes.updatedAt)],
        limit: 1,
      },
    },
  });
}

export async function getUpcomingPublications(limit: number = 10) {
  const now = new Date();
  return db.query.notes.findMany({
    where: and(
      eq(notes.stage, 'scheduled'),
      eq(notes.archived, false),
      gte(notes.scheduledDate, now)
    ),
    orderBy: [notes.scheduledDate],
    limit,
    with: {
      tags: true,
      platforms: true,
    },
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [byStage, byPillar, recentActivity, upcomingPublications, totalResult] = await Promise.all([
    getStageStats(),
    getPillarStats(),
    getRecentActivity(),
    getUpcomingPublications(),
    db.select({ count: count() }).from(notes).where(eq(notes.archived, false)),
  ]);

  return {
    totalNotes: totalResult[0]?.count ?? 0,
    byStage,
    byPillar,
    recentActivity: recentActivity as any,
    upcomingPublications: upcomingPublications as any,
  };
}
