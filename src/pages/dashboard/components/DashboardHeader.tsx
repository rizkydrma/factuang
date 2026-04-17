import React from 'react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

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
        <h1 className="text-base font-semibold tracking-tight truncate">
          Hi, {userName || '...'}
        </h1>
      </div>

      <div className="flex items-center gap-1 text-[11px] font-semibold shrink-0 bg-primary-foreground/10 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-primary-foreground/20">
        <button
          onClick={() => onChangeMonth(-1)}
          className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors active:scale-95 flex items-center justify-center"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={12} strokeWidth={2.5} />
        </button>
        <span className="w-[75px] text-center truncate">{monthYear}</span>
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
