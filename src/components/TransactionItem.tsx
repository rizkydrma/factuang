import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { DEFAULT_ICON, ICON_MAP } from '@/constants/icons';
import { Typography } from '@/components/ui/Typography';
import { cn, formatCurrency } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { type Category, type Transaction } from '@/db/database';

interface TransactionItemProps {
  t: Transaction;
  categoriesMap?: Map<string, Category>;
  isCensored: boolean;
  onDeleteRequest: (id: number) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  t,
  categoriesMap,
  isCensored,
  onDeleteRequest,
}) => {
  const { openEditModal } = useUIStore();
  const x = useMotionValue(0);

  // Edit (Swipe Right)
  const editOpacity = useTransform(x, [0, 80], [0, 1]);
  const editScale = useTransform(x, [0, 80], [0.8, 1]);
  const editBackground = useTransform(
    x,
    [0, 80],
    ['rgba(254, 240, 138, 0)', 'rgba(254, 240, 138, 1)'], // yellow-200 equivalent
  );

  // Delete (Swipe Left)
  const deleteOpacity = useTransform(x, [0, -80], [0, 1]);
  const deleteScale = useTransform(x, [0, -80], [0.8, 1]);
  const deleteBackground = useTransform(
    x,
    [0, -80],
    ['rgba(220, 38, 38, 0)', 'rgba(220, 38, 38, 1)'], // red-600 equivalent
  );

  const canonical = categoriesMap?.get(t.category);
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
          <Typography variant="small" as="span">
            Edit
          </Typography>
        </div>
      </motion.div>

      {/* Background Layer (Delete Action) */}
      <motion.div
        style={{
          opacity: deleteOpacity,
          scale: deleteScale,
          backgroundColor: deleteBackground,
        }}
        className="absolute inset-0 flex items-center justify-end pr-6 text-white font-bold"
      >
        <div className="flex flex-col items-center gap-1">
          <HugeiconsIcon icon={Delete02Icon} size={20} />
          <Typography variant="small" as="span">
            Delete
          </Typography>
        </div>
      </motion.div>

      {/* Foreground Layer (Card) */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={async (_, { offset }) => {
          if (offset.x > 80) {
            if (t.id) {
              openEditModal(t.id);
            }
          } else if (offset.x < -80) {
            if (t.id) {
              onDeleteRequest(t.id);
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
            <Typography variant="p" weight="semibold" className="truncate">
              {t.note || t.category}
            </Typography>
            <div className="flex items-center gap-1.5 mt-1">
              <Typography variant="xs" muted>
                {dateTimeString}
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-end shrink-0">
          <Typography variant="p" weight="bold" mono>
            {isCensored ? 'Rp ******' : formatCurrency(t.amount)}
          </Typography>
          <Typography variant="xs" muted className="mt-1 truncate text-right">
            {t.category}
          </Typography>
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionItem;
