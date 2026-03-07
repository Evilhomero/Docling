import { Header } from '@/components/layout/header';
import { auth, signOut } from '@/lib/auth';
import { PILLARS, PLATFORMS, STAGES } from '@/lib/constants';

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="flex flex-col h-full">
      <Header title="Ajustes" />
      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto">
        {/* Profile */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Perfil</h2>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">
              ✈️
            </div>
            <div>
              <p className="font-medium text-foreground">{session?.user?.name ?? 'Diego Ortiz'}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email ?? 'diego@cuernatravel.com'}</p>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
              className="ml-auto"
            >
              <button
                type="submit"
                className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-accent transition-colors text-muted-foreground"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </section>

        {/* Pilares */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pilares de contenido</h2>
          <div className="space-y-2">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${pillar.bgClass} border border-transparent`}
              >
                <span className="text-xl">{pillar.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${pillar.textClass}`}>{pillar.label}</p>
                  <p className="text-xs text-muted-foreground">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Plataformas */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Plataformas</h2>
          <div className="space-y-2">
            {PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <span className="text-xl">{platform.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{platform.label}</p>
                  <p className="text-xs text-muted-foreground">{platform.format}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {platform.cadence}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Pipeline stages */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Etapas del Pipeline</h2>
          <div className="space-y-2">
            {STAGES.map((stage, idx) => (
              <div key={stage.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                <div className={`w-8 h-8 rounded-full ${stage.bgColor} flex items-center justify-center text-sm`}>
                  {stage.emoji}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${stage.textColor}`}>{stage.label}</p>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{idx + 1}</span>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Acerca de</h2>
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-sm text-foreground font-medium">Content Pipeline v0.1.0</p>
            <p className="text-xs text-muted-foreground">
              Sistema de gestión de contenido basado en la metodología Zettelkasten de Niklas Luhmann.
              Lleva tus ideas desde captura cruda hasta publicación en redes sociales.
            </p>
            <p className="text-xs text-muted-foreground">
              Construido con Next.js 15, Drizzle ORM, Vercel Postgres, y Auth.js.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
