import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { getNoteById } from '@/server/queries/notes';
import { NoteDetailClient } from './note-detail-client';

interface NotePageProps {
  params: Promise<{ id: string }>;
}

async function NoteDetailContent({ id }: { id: string }) {
  const note = await getNoteById(id);
  if (!note) notFound();

  return <NoteDetailClient note={note} />;
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="p-4 space-y-4 max-w-3xl mx-auto">
              <div className="h-8 w-3/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-32 bg-muted/30 rounded-xl animate-pulse" />
              <div className="h-48 bg-muted/30 rounded-xl animate-pulse" />
            </div>
          }
        >
          <NoteDetailContent id={id} />
        </Suspense>
      </div>
    </div>
  );
}
