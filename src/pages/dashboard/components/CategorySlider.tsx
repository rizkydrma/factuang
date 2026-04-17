import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '../utils';

interface CategorySliderProps {
  categorySummaries: Array<{
    name: string;
    icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
    color: string;
    total: number;
  }>;
  isCensored: boolean;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({
  categorySummaries,
  isCensored,
}) => {
  if (categorySummaries.length === 0) {
    return <div className="h-10" />;
  }

  return (
    <div className="relative z-20 w-full">
      <div className="overflow-x-auto hide-scrollbar -mx-6">
        <div className="flex px-6 gap-4 pb-4 snap-x snap-mandatory">
          {categorySummaries.map((cat, idx) => (
            <div
              key={idx}
              className="snap-start shrink-0 w-36 glass-card-sm rounded-xl p-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-sm transition-transform active:scale-90',
                    cat.color,
                    'text-white',
                  )}
                >
                  <HugeiconsIcon icon={cat.icon} size={18} strokeWidth={2} />
                </div>
              </div>
              <div className="space-y-0.5 mt-2">
                <p className="text-xs font-semibold text-muted-foreground truncate">
                  {cat.name}
                </p>
                <p className="text-sm font-bold text-white tabular-nums truncate">
                  {isCensored ? 'Rp ******' : formatCurrency(cat.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
