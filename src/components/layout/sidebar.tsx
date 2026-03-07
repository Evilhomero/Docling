'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Columns3,
  FileText,
  Calendar,
  GitBranch,
  Settings,
  Plus,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Columns3 },
  { href: '/notes', label: 'Notas', icon: FileText },
  { href: '/calendar', label: 'Calendario', icon: Calendar },
  { href: '/graph', label: 'Grafo', icon: GitBranch },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 h-full border-r border-border bg-card/50 shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xl">✈️</span>
          <div>
            <p className="font-semibold text-sm text-foreground">Content Pipeline</p>
            <p className="text-xs text-muted-foreground">Cuernatravel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          href="/notes/new"
          className="flex items-center gap-2 w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors justify-center"
        >
          <Plus className="h-4 w-4" />
          Nueva nota
        </Link>
      </div>
    </aside>
  );
}
