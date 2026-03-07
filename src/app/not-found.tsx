import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold text-foreground mb-2">Página no encontrada</h1>
      <p className="text-muted-foreground mb-6">Esta página no existe o fue eliminada.</p>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Ir al Dashboard
      </Link>
    </div>
  );
}
