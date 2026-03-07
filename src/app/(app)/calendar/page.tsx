import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { getScheduledNotes } from '@/server/queries/notes';
import { CalendarView } from './calendar-view';

async function CalendarContent() {
  const notes = await getScheduledNotes();
  return <CalendarView notes={notes} />;
}

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Calendario Editorial" />
      <div className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="p-4">
              <div className="h-96 bg-muted/30 rounded-xl animate-pulse" />
            </div>
          }
        >
          <CalendarContent />
        </Suspense>
      </div>
    </div>
  );
}
