import React from 'react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Typography } from '@/components/ui/Typography';

interface DashboardHeaderProps {
  userName: string | null;
  monthYear: string;
  onChangeMonth: (delta: number) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  monthYear,
  onChangeMonth,
}) => {
  return (
    <div className="flex items-center justify-between relative z-10 w-full pt-2">
      <div className="flex-1 min-w-0 pr-4">
        <Typography variant="p" weight="semibold" className="truncate" as="h1">
          Hi, {userName || '...'}
        </Typography>
      </div>

      <div className="flex items-center gap-1 text-[11px] font-semibold shrink-0 bg-primary-foreground/10 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-primary-foreground/20">
        <button
          onClick={() => onChangeMonth(-1)}
          className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors active:scale-95 flex items-center justify-center"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={12} strokeWidth={2.5} />
        </button>
        <Typography
          variant="xs"
          weight="semibold"
          className="w-[75px] text-center truncate"
          as="span"
        >
          {monthYear}
        </Typography>
        <button
          onClick={() => onChangeMonth(1)}
          className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors active:scale-95 flex items-center justify-center"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
