import { cn } from '@/lib/utils';
import { getPillar } from '@/lib/utils';
import type { Pillar } from '@/types';

interface PillarBadgeProps {
  pillar: Pillar | null | undefined;
  className?: string;
}

export function PillarBadge({ pillar, className }: PillarBadgeProps) {
  if (!pillar) return null;
  const pillarData = getPillar(pillar);
  if (!pillarData) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        pillarData.bgClass,
        pillarData.textClass,
        className
      )}
    >
      <span>{pillarData.icon}</span>
      {pillarData.label}
    </span>
  );
}
