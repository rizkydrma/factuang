import { DEFAULT_ICON, ICON_MAP } from '@/constants/icons';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { Invoice01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import React from 'react';
import { type Category, type Transaction } from '../../../db/database';
import { formatCurrency, formatGroupDate } from '../utils';

interface TransactionHistoryProps {
  groupedTransactions: Array<[string, Transaction[]]>;
  categoriesMap: Map<string, Category>;
  isCensored: boolean;
}

const TransactionItem: React.FC<{
  t: Transaction;
  categoriesMap: Map<string, Category>;
  isCensored: boolean;
}> = ({ t, categoriesMap, isCensored }) => {
  const { openEditModal } = useUIStore();
  const x = useMotionValue(0);

  const editOpacity = useTransform(x, [0, 80], [0, 1]);
  const editScale = useTransform(x, [0, 80], [0.8, 1]);
  const editBackground = useTransform(
    x,
    [0, 80],
    ['rgba(254, 240, 138, 0)', 'rgba(254, 240, 138, 1)'], // yellow-200 equivalent
  );

  const canonical = categoriesMap.get(t.category);
  const icon = canonical?.icon
    ? ICON_MAP[canonical.icon] || DEFAULT_ICON
    : t.categoryIcon
      ? ICON_MAP[t.categoryIcon] || DEFAULT_ICON
      : DEFAULT_ICON;
  const colorClass = canonical?.color || t.categoryColor || 'bg-slate-500';

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
    <div className="relative overflow-hidden rounded-xl border">
      {/* Background Layer (Edit Action) */}
      <motion.div
        style={{
          opacity: editOpacity,
          scale: editScale,
          backgroundColor: editBackground,
        }}
        className="absolute inset-0 flex items-center pl-6 text-amber-900 font-bold"
      >
        <div className="flex flex-col items-center gap-1">
          <HugeiconsIcon icon={PencilEdit01Icon} size={20} />
          <span className="text-[12px]">Edit</span>
        </div>
      </motion.div>

      {/* Foreground Layer (Card) */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.05, right: 0.5 }}
        onDragEnd={(_, { offset }) => {
          if (offset.x > 80) {
            if (t.id) {
              openEditModal(t.id);
            }
          }
        }}
        className="glass-card p-4 flex items-center justify-between relative z-10 bg-background/80"
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
      </motion.div>
    </div>
  );
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
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
            {txs.map((t: Transaction) => (
              <TransactionItem
                key={t.id}
                t={t}
                categoriesMap={categoriesMap}
                isCensored={isCensored}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistory;
