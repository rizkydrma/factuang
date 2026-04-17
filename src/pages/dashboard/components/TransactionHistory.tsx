import React from 'react';
import { Invoice01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';
import { DEFAULT_ICON, ICON_MAP } from '@/constants/icons';
import { formatCurrency, formatGroupDate } from '../utils';
import { type Transaction, type Category } from '../../../db/database';

interface TransactionHistoryProps {
  groupedTransactions: Array<[string, Transaction[]]>;
  categoriesMap: Map<string, Category>;
  isCensored: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  groupedTransactions,
  categoriesMap,
  isCensored,
}) => {
  if (groupedTransactions.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center gap-4 opacity-50 mt-4">
        <div className="p-5 bg-secondary/50 rounded-full text-muted-foreground/60">
          <HugeiconsIcon icon={Invoice01Icon} size={28} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Belum ada transaksi
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6">
      {groupedTransactions.map(([dateKey, txs]) => (
        <div key={dateKey} className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[13px] font-semibold text-foreground/90 tracking-wide">
              {formatGroupDate(dateKey)}
            </h3>
            <span className="text-[11px] font-semibold text-foreground/80 px-2.5 py-1 glass-card-sm rounded-lg">
              {txs.length} Items
            </span>
          </div>

          <div className="space-y-3">
            {txs.map((t: Transaction) => {
              const canonical = categoriesMap.get(t.category);
              const icon = canonical?.icon
                ? ICON_MAP[canonical.icon] || DEFAULT_ICON
                : t.categoryIcon
                  ? ICON_MAP[t.categoryIcon] || DEFAULT_ICON
                  : DEFAULT_ICON;
              const colorClass =
                canonical?.color || t.categoryColor || 'bg-slate-500';

              const dateTimeString =
                new Date(t.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }) +
                ' ' +
                new Date(t.date).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

              return (
                <div
                  key={t.id}
                  className="glass-card rounded-[1.25rem] p-4 flex items-center justify-between relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={cn(
                        'w-[42px] h-[42px] rounded-xl border border-white/10 flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95',
                        colorClass,
                        'text-white',
                      )}
                    >
                      <HugeiconsIcon icon={icon} size={20} strokeWidth={2} />
                    </div>

                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-[14px] font-semibold text-foreground truncate">
                        {t.note || t.category}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-[10px] text-muted-foreground/90 font-medium">
                          {dateTimeString}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-end shrink-0">
                    <p className="text-[14px] font-bold text-foreground tabular-nums">
                      {isCensored ? 'Rp ******' : formatCurrency(t.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/90 font-medium mt-1 truncate text-right">
                      {t.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
