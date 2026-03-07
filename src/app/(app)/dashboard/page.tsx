import Link from 'next/link';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { getDashboardStats } from '@/server/queries/stats';
import { STAGES, PILLARS } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/utils';
import { StageBadge } from '@/components/shared/stage-badge';
import { PillarBadge } from '@/components/shared/pillar-badge';
import type { Pillar, Stage } from '@/types';

async function DashboardContent() {
  const stats = await getDashboardStats();

  const totalByStage = stats.byStage.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto">
      {/* Stats by stage */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Estado del Pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STAGES.map((stage) => {
            const stat = stats.byStage.find((s) => s.stage === stage.id);
            const count = stat?.count ?? 0;
            return (
              <Link
                key={stage.id}
                href={`/notes?stage=${stage.id}`}
                className={`flex flex-col p-3 rounded-xl border transition-colors hover:border-primary/50 ${stage.bgColor} ${stage.borderColor}`}
              >
                <span className="text-xl mb-1">{stage.emoji}</span>
                <span className={`text-2xl font-bold ${stage.textColor}`}>{count}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{stage.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Pillar distribution */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Distribución por Pilar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PILLARS.map((pillar) => {
            const stat = stats.byPillar.find((s) => s.pillar === pillar.id);
            const count = stat?.count ?? 0;
            const pct = totalByStage > 0 ? Math.round((count / totalByStage) * 100) : 0;
            return (
              <Link
                key={pillar.id}
                href={`/notes?pillar=${pillar.id}`}
                className={`flex items-center gap-3 p-3 rounded-xl ${pillar.bgClass} border border-transparent hover:border-current/30 transition-colors`}
              >
                <span className="text-xl">{pillar.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${pillar.textClass}`}>{count}</p>
                  <p className="text-xs text-muted-foreground truncate">{pillar.label}</p>
                </div>
                <span className="text-xs text-muted-foreground">{pct}%</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming publications */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Próximas publicaciones</h2>
            <Link href="/calendar" className="text-xs text-primary hover:underline">Ver calendario →</Link>
          </div>
          <div className="space-y-2">
            {stats.upcomingPublications.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center border border-border rounded-xl">
                No hay publicaciones programadas
              </p>
            ) : (
              stats.upcomingPublications.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-card/80 transition-all"
                >
                  <div className="text-lg">📅</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                    {note.scheduledDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.scheduledDate).toLocaleDateString('es-MX', {
                          weekday: 'short', day: 'numeric', month: 'short',
                        })}
                      </p>
                    )}
                  </div>
                  {note.pillar && <PillarBadge pillar={note.pillar} />}
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">Actividad reciente</h2>
            <Link href="/notes" className="text-xs text-primary hover:underline">Ver todas →</Link>
          </div>
          <div className="space-y-2">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center border border-border rounded-xl">
                Sin actividad reciente
              </p>
            ) : (
              stats.recentActivity.slice(0, 8).map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-card/80 transition-all"
                >
                  <StageBadge stage={note.stage as Stage} showEmoji />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeTime(new Date(note.updatedAt))}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />
      <div className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
