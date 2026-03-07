import { cn } from '@/lib/utils';
import { getStage } from '@/lib/utils';
import type { Stage } from '@/types';

interface StageBadgeProps {
  stage: Stage;
  className?: string;
  showEmoji?: boolean;
}

export function StageBadge({ stage, className, showEmoji = true }: StageBadgeProps) {
  const stageData = getStage(stage);
  if (!stageData) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        stageData.bgColor,
        stageData.textColor,
        className
      )}
    >
      {showEmoji && <span>{stageData.emoji}</span>}
      {stageData.label}
    </span>
  );
}
