'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getPillar } from '@/lib/utils';
import { PILLARS } from '@/lib/constants';
import type { Note, NoteConnection } from '@/types';

interface GraphViewProps {
  nodes: Note[];
  edges: NoteConnection[];
}

interface NodeData {
  id: string;
  title: string;
  pillar: string | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
}

interface EdgeData {
  source: string;
  target: string;
  type: string;
}

export function GraphView({ nodes: initialNodes, edges: initialEdges }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Note | null>(null);
  const [graphNodes, setGraphNodes] = useState<NodeData[]>([]);
  const [graphEdges, setGraphEdges] = useState<EdgeData[]>([]);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const animFrameRef = useRef<number>(0);

  const W = 800;
  const H = 600;

  useEffect(() => {
    if (initialNodes.length === 0) return;

    // Initialize node positions
    const newNodes: NodeData[] = initialNodes.map((n, i) => ({
      id: n.id,
      title: n.title,
      pillar: n.pillar,
      x: W / 2 + Math.cos((i / initialNodes.length) * 2 * Math.PI) * 200,
      y: H / 2 + Math.sin((i / initialNodes.length) * 2 * Math.PI) * 200,
      vx: 0,
      vy: 0,
    }));

    const newEdges: EdgeData[] = initialEdges.map((e) => ({
      source: e.sourceNoteId,
      target: e.targetNoteId,
      type: e.connectionType ?? 'related',
    }));

    setGraphNodes(newNodes);
    setGraphEdges(newEdges);

    // Simple force simulation
    let nodes = [...newNodes];

    const simulate = () => {
      const alpha = 0.1;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const repulse = 3000 / (dist * dist);
          const fx = (dx / dist) * repulse;
          const fy = (dy / dist) * repulse;
          nodes[i].vx -= fx * alpha;
          nodes[i].vy -= fy * alpha;
          nodes[j].vx += fx * alpha;
          nodes[j].vy += fy * alpha;
        }
      }

      // Attraction for connected nodes
      newEdges.forEach((e) => {
        const src = nodes.find((n) => n.id === e.source);
        const tgt = nodes.find((n) => n.id === e.target);
        if (!src || !tgt) return;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const attract = (dist - 100) * 0.05;
        const fx = (dx / dist) * attract;
        const fy = (dy / dist) * attract;
        src.vx += fx * alpha;
        src.vy += fy * alpha;
        tgt.vx -= fx * alpha;
        tgt.vy -= fy * alpha;
      });

      // Center gravity
      nodes.forEach((n) => {
        n.vx += (W / 2 - n.x) * 0.01 * alpha;
        n.vy += (H / 2 - n.y) * 0.01 * alpha;
        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x += n.vx;
        n.y += n.vy;
        // Clamp
        n.x = Math.max(20, Math.min(W - 20, n.x));
        n.y = Math.max(20, Math.min(H - 20, n.y));
      });

      setGraphNodes([...nodes]);
      animFrameRef.current = requestAnimationFrame(simulate);
    };

    // Run for ~120 frames then stop
    let frame = 0;
    const limitedSimulate = () => {
      if (frame > 120) return;
      frame++;
      simulate();
    };

    animFrameRef.current = requestAnimationFrame(limitedSimulate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [initialNodes.length, initialEdges.length]);

  const getNodeById = (id: string) => graphNodes.find((n) => n.id === id);
  const getFullNote = (id: string) => initialNodes.find((n) => n.id === id);

  const getPillarColor = (pillar: string | null) => {
    if (!pillar) return '#64748b';
    const p = getPillar(pillar);
    return p?.color ?? '#64748b';
  };

  if (initialNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-4xl mb-3">🕸️</p>
        <p className="text-muted-foreground text-sm">No hay notas aún</p>
        <Link href="/notes/new" className="mt-4 text-primary text-sm hover:underline">
          Crear primera nota
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full relative">
      {/* Graph */}
      <div className="flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="bg-background/50"
        >
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
            </marker>
          </defs>

          {/* Edges */}
          {graphEdges.map((edge, i) => {
            const src = getNodeById(edge.source);
            const tgt = getNodeById(edge.target);
            if (!src || !tgt) return null;
            return (
              <line
                key={i}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="#334155"
                strokeWidth={1.5}
                strokeOpacity={0.6}
                markerEnd="url(#arrow)"
              />
            );
          })}

          {/* Nodes */}
          {graphNodes.map((node) => {
            const color = getPillarColor(node.pillar);
            const isSelected = selectedNode?.id === node.id;
            const hasConnections = graphEdges.some(
              (e) => e.source === node.id || e.target === node.id
            );

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(isSelected ? null : (getFullNote(node.id) ?? null))}
                className="cursor-pointer"
              >
                <circle
                  r={isSelected ? 12 : hasConnections ? 9 : 6}
                  fill={color}
                  fillOpacity={0.8}
                  stroke={isSelected ? '#fff' : color}
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-all"
                />
                <text
                  x={0}
                  y={isSelected ? 18 : 14}
                  textAnchor="middle"
                  fontSize={isSelected ? 11 : 9}
                  fill="#94a3b8"
                  className="select-none pointer-events-none"
                >
                  {node.title.length > 20 ? node.title.slice(0, 20) + '…' : node.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Side panel */}
      {selectedNode && (
        <div className="w-64 shrink-0 border-l border-border bg-card p-4 overflow-y-auto">
          <button
            onClick={() => setSelectedNode(null)}
            className="text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            ✕ Cerrar
          </button>
          <h3 className="text-sm font-semibold text-foreground mb-2">{selectedNode.title}</h3>
          {selectedNode.pillar && (
            <div className="mb-2">
              {(() => {
                const p = getPillar(selectedNode.pillar);
                return p ? (
                  <span className={`text-xs ${p.textClass} ${p.bgClass} px-2 py-0.5 rounded-full`}>
                    {p.icon} {p.label}
                  </span>
                ) : null;
              })()}
            </div>
          )}
          <p className="text-xs text-muted-foreground mb-4">
            {selectedNode.rawNote?.slice(0, 150) || 'Sin contenido'}
            {(selectedNode.rawNote?.length ?? 0) > 150 && '...'}
          </p>
          <Link
            href={`/notes/${selectedNode.id}`}
            className="text-xs text-primary hover:underline"
          >
            Ver nota completa →
          </Link>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-xl p-3 space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Pilares</p>
        {PILLARS.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-muted-foreground">{p.icon} {p.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span className="text-xs text-muted-foreground">Sin pilar</span>
        </div>
      </div>
    </div>
  );
}
