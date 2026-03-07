import { Header } from '@/components/layout/header';
import { NoteForm } from '@/components/notes/note-form';

export default function NewNotePage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Nueva nota" />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <NoteForm />
        </div>
      </div>
    </div>
  );
}
