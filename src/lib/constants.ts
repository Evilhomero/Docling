export const STAGES = [
  {
    id: 'fleeting',
    label: 'Captura',
    emoji: '💡',
    zettelName: 'Fleeting Note',
    description: 'Idea cruda — libreta, WhatsApp, inspiración',
    color: '#F59E0B',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'literature',
    label: 'Referencia',
    emoji: '📖',
    zettelName: 'Literature Note',
    description: 'Investigación, fuentes, benchmarks',
    color: '#8B5CF6',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-500',
    borderColor: 'border-violet-500/30',
  },
  {
    id: 'permanent',
    label: 'Estructura',
    emoji: '🧠',
    zettelName: 'Permanent Note',
    description: 'Idea procesada, conectada, con pilar asignado',
    color: '#0EA5E9',
    bgColor: 'bg-sky-500/10',
    textColor: 'text-sky-500',
    borderColor: 'border-sky-500/30',
  },
  {
    id: 'production',
    label: 'Producción',
    emoji: '🎨',
    zettelName: 'Output Note',
    description: 'Adaptación a formato de cada plataforma',
    color: '#10B981',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/30',
  },
  {
    id: 'scheduled',
    label: 'Programado',
    emoji: '📅',
    zettelName: 'Index Note',
    description: 'Copy listo, fecha asignada, listo para publicar',
    color: '#6366F1',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-500',
    borderColor: 'border-indigo-500/30',
  },
  {
    id: 'published',
    label: 'Publicado',
    emoji: '✅',
    zettelName: 'Archive',
    description: 'En la red social — con URL de publicación',
    color: '#22C55E',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-500',
    borderColor: 'border-green-500/30',
  },
] as const;

export const PILLARS = [
  { id: 'aeropuerto', label: 'Aeropuerto sin estrés', icon: '✈️', color: '#0EA5E9', bgClass: 'bg-sky-500/10', textClass: 'text-sky-500', description: 'AICM/AIFA traslados' },
  { id: 'bodas', label: 'Bodas en Morelos', icon: '💒', color: '#EC4899', bgClass: 'bg-pink-500/10', textClass: 'text-pink-500', description: 'Transporte para bodas' },
  { id: 'tours', label: 'Tours & experiencias', icon: '🏔️', color: '#10B981', bgClass: 'bg-emerald-500/10', textClass: 'text-emerald-500', description: 'Tepoztlán, Taxco, Grutas' },
  { id: 'corporativo', label: 'Corporativo & eventos', icon: '🏢', color: '#8B5CF6', bgClass: 'bg-violet-500/10', textClass: 'text-violet-500', description: 'Empresas y eventos' },
  { id: 'confianza', label: 'Confianza / prueba', icon: '🛡️', color: '#F59E0B', bgClass: 'bg-amber-500/10', textClass: 'text-amber-500', description: 'Flotilla real, limpieza, protocolos' },
  { id: 'educacion', label: 'Educación útil', icon: '📚', color: '#EF4444', bgClass: 'bg-red-500/10', textClass: 'text-red-500', description: 'Tips, checklists, rutas' },
] as const;

export const PLATFORMS = [
  { id: 'instagram_carousel', label: 'IG Carrusel', icon: '📸', format: 'Presentación NotebookLM → Carrusel', cadence: '2/semana' },
  { id: 'instagram_reel', label: 'IG Reel', icon: '🎬', format: 'Video corto vertical', cadence: '3/semana' },
  { id: 'instagram_story', label: 'IG Story', icon: '📱', format: 'Story efímera', cadence: 'diario' },
  { id: 'facebook_info', label: 'FB Infografía', icon: '📊', format: 'Infografía / imagen informativa', cadence: '2/semana' },
  { id: 'facebook_post', label: 'FB Post', icon: '📝', format: 'Post con imagen', cadence: '3/semana' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', format: 'Video largo / podcast NotebookLM', cadence: '1/semana' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', format: 'Video corto / generado', cadence: '3/semana' },
  { id: 'whatsapp_status', label: 'WA Status', icon: '💬', format: 'Status visual', cadence: '4-6/semana' },
] as const;

export const SOURCE_TYPES = [
  { id: 'libreta', label: 'Libreta', emoji: '📓', description: 'Nota a mano' },
  { id: 'whatsapp', label: 'WhatsApp', emoji: '💬', description: 'Chat propio de captura' },
  { id: 'web', label: 'Web', emoji: '🌐', description: 'Artículo, blog, recurso online' },
  { id: 'inspiracion', label: 'Inspiración', emoji: '💡', description: 'Post de otra cuenta, tendencia' },
  { id: 'cliente', label: 'Cliente', emoji: '👤', description: 'Feedback o pregunta de cliente' },
  { id: 'idea', label: 'Idea propia', emoji: '🧠', description: 'Idea espontánea' },
] as const;

export const CONNECTION_TYPES = [
  { id: 'related', label: 'Relacionado', emoji: '🔗', description: 'Tema similar' },
  { id: 'inspires', label: 'Inspira', emoji: '💡', description: 'Esta nota inspiró la otra' },
  { id: 'continues', label: 'Continúa', emoji: '➡️', description: 'Serie o secuencia' },
  { id: 'contradicts', label: 'Contradice', emoji: '⚡', description: 'Perspectiva opuesta' },
  { id: 'format_ref', label: 'Formato', emoji: '🎨', description: 'Referencia de formato/diseño' },
] as const;

export const STAGE_ORDER = ['fleeting', 'literature', 'permanent', 'production', 'scheduled', 'published'] as const;
