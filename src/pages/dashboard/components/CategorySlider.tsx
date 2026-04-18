import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '../utils';
import { Typography } from '@/components/ui/Typography';

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
                <Typography
                  variant="xs"
                  weight="semibold"
                  className="text-gray-200 truncate capitalize"
                >
                  {cat.name}
                </Typography>
                <Typography
                  variant="small"
                  weight="bold"
                  mono
                  className="text-white truncate"
                >
                  {isCensored ? 'Rp ******' : formatCurrency(cat.total)}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
