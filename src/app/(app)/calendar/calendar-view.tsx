'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PILLARS } from '@/lib/constants';
import { getPillar, getPlatform } from '@/lib/utils';
import type { NoteSummary } from '@/types';

interface CalendarViewProps {
  notes: NoteSummary[];
}

export function CalendarView({ notes }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay(); // 0 = Sunday

  const days: (Date | null)[] = [
    ...Array(startPadding).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ];

  // Pad to complete last week
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  const notesByDay = notes.reduce(
    (acc, note) => {
      if (!note.scheduledDate) return acc;
      const key = new Date(note.scheduledDate).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(note);
      return acc;
    },
    {} as Record<string, NoteSummary[]>
  );

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();

  const monthName = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-semibold capitalize">{monthName}</h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div key={day} className="text-center py-2 text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const isToday = day?.toDateString() === today.toDateString();
            const dayNotes = day ? notesByDay[day.toDateString()] ?? [] : [];
            const isCurrentMonth = day !== null;

            return (
              <div
                key={i}
                className={`min-h-[80px] border-b border-r border-border p-1 ${
                  !isCurrentMonth ? 'bg-muted/5' : 'bg-background'
                } ${i % 7 === 6 ? 'border-r-0' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                    }`}>
                      {day.getDate()}
                    </div>

                    <div className="space-y-0.5">
                      {dayNotes.slice(0, 3).map((note) => {
                        const pillarData = note.pillar ? getPillar(note.pillar) : null;
                        return (
                          <Link
                            key={note.id}
                            href={`/notes/${note.id}`}
                            className={`block text-[10px] leading-tight px-1 py-0.5 rounded truncate ${
                              pillarData ? `${pillarData.bgClass} ${pillarData.textClass}` : 'bg-muted text-muted-foreground'
                            }`}
                            title={note.title}
                          >
                            {note.title}
                          </Link>
                        );
                      })}
                      {dayNotes.length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-1">
                          +{dayNotes.length - 3} más
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {PILLARS.map((p) => (
          <div key={p.id} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${p.bgClass} ${p.textClass}`}>
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </div>
        ))}
      </div>

      {/* Upcoming list */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Este mes</h3>
        <div className="space-y-2">
          {notes.filter((n) => {
            if (!n.scheduledDate) return false;
            const d = new Date(n.scheduledDate);
            return d.getMonth() === month && d.getFullYear() === year;
          }).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Sin publicaciones programadas este mes
            </p>
          ) : (
            notes
              .filter((n) => {
                if (!n.scheduledDate) return false;
                const d = new Date(n.scheduledDate);
                return d.getMonth() === month && d.getFullYear() === year;
              })
              .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
              .map((note) => {
                const pillarData = note.pillar ? getPillar(note.pillar) : null;
                return (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="text-xs text-muted-foreground w-12 shrink-0 text-center">
                      {new Date(note.scheduledDate!).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{note.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {note.platforms.slice(0, 2).map((p) => {
                        const platform = getPlatform(p.platform);
                        return <span key={p.id} title={platform?.label}>{platform?.icon}</span>;
                      })}
                      {pillarData && (
                        <span className={`text-xs ${pillarData.textClass}`}>{pillarData.icon}</span>
                      )}
                    </div>
                  </Link>
                );
              })
          )}
        </div>
      </section>
    </div>
  );
}
