'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Header({ title }: { title?: string }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/notes?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3 sticky top-0 z-40">
      {title && (
        <h1 className="text-base font-semibold text-foreground hidden lg:block shrink-0">
          {title}
        </h1>
      )}

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar notas..."
            className="pl-9 h-9 text-sm bg-muted/50 border-transparent focus-visible:border-primary"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/notes/new"
          className="lg:hidden h-9 w-9 rounded-full bg-primary flex items-center justify-center"
        >
          <span className="text-primary-foreground font-bold text-lg leading-none">+</span>
        </Link>
      </div>
    </header>
  );
}
