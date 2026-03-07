import { getPlatform } from '@/lib/utils';
import type { Platform } from '@/types';
import type { NotePlatform } from '@/types';

interface PlatformIconsProps {
  platforms: NotePlatform[];
  max?: number;
}

export function PlatformIcons({ platforms, max = 4 }: PlatformIconsProps) {
  if (!platforms.length) return null;

  const visible = platforms.slice(0, max);
  const rest = platforms.length - max;

  return (
    <div className="flex items-center gap-0.5">
      {visible.map((p) => {
        const platform = getPlatform(p.platform);
        return (
          <span
            key={p.id}
            title={platform?.label ?? p.platform}
            className="text-sm"
          >
            {platform?.icon ?? '📱'}
          </span>
        );
      })}
      {rest > 0 && (
        <span className="text-xs text-muted-foreground">+{rest}</span>
      )}
    </div>
  );
}
