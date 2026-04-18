import React from 'react';
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { formatCurrency } from '../utils';
import { Typography } from '@/components/ui/Typography';

interface DashboardSummaryProps {
  totalExpense: number;
  isCensored: boolean;
  onToggleCensored: () => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  totalExpense,
  isCensored,
  onToggleCensored,
}) => {
  return (
    <div className="relative z-10 flex items-end justify-between w-full pb-2">
      <div className="space-y-1">
        <Typography
          variant="small"
          weight="medium"
          className="text-primary-foreground/90"
        >
          Total Pengeluaran
        </Typography>
        <Typography
          variant="h2"
          weight="bold"
          mono
          as="p"
          className="leading-none drop-shadow-sm"
        >
          {isCensored ? 'Rp ******' : formatCurrency(totalExpense)}
        </Typography>
      </div>
      <button
        onClick={onToggleCensored}
        className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors mb-0.5 active:scale-95"
        aria-label="Toggle visibility"
      >
        <HugeiconsIcon
          icon={isCensored ? ViewOffIcon : ViewIcon}
          size={24}
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
};
