import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { KanbanBoard } from '@/components/pipeline/kanban-board';
import { getNotes } from '@/server/queries/notes';
import { STAGES } from '@/lib/constants';
import type { Stage, NoteSummary } from '@/types';

async function PipelineContent() {
  const notes = await getNotes({ archived: false });

  const notesByStage = STAGES.reduce(
    (acc, stage) => {
      acc[stage.id as Stage] = notes.filter((n) => n.stage === stage.id);
      return acc;
    },
    {} as Record<Stage, NoteSummary[]>
  );

  return <KanbanBoard notesByStage={notesByStage} />;
}

export default function PipelinePage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Pipeline" />
      <div className="flex-1 overflow-hidden p-4">
        <Suspense
          fallback={
            <div className="flex gap-3 h-full">
              {STAGES.map((s) => (
                <div key={s.id} className="w-60 shrink-0">
                  <div className={`h-8 rounded-lg mb-2 animate-pulse ${s.bgColor}`} />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <PipelineContent />
        </Suspense>
      </div>
    </div>
  );
}
