import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { getAllNoteConnections } from '@/server/queries/notes';
import { GraphView } from './graph-view';

async function GraphContent() {
  const { nodes, edges } = await getAllNoteConnections();
  return <GraphView nodes={nodes as any[]} edges={edges} />;
}

export default function GraphPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Grafo de Conexiones" />
      <div className="flex-1 overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground text-sm animate-pulse">Cargando grafo...</div>
            </div>
          }
        >
          <GraphContent />
        </Suspense>
      </div>
    </div>
  );
}
