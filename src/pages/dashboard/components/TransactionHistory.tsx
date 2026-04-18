import { DEFAULT_ICON, ICON_MAP } from '@/constants/icons';
import { Typography } from '@/components/ui/Typography';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import {
  Invoice01Icon,
  PencilEdit01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import React, { useState } from 'react';
import { db, type Category, type Transaction } from '../../../db/database';
import { formatCurrency, formatGroupDate } from '../utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TransactionHistoryProps {
  groupedTransactions: Array<[string, Transaction[]]>;
  categoriesMap: Map<string, Category>;
  isCensored: boolean;
}

const TransactionItem: React.FC<{
  t: Transaction;
  categoriesMap: Map<string, Category>;
  isCensored: boolean;
  onDeleteRequest: (id: number) => void;
}> = ({ t, categoriesMap, isCensored, onDeleteRequest }) => {
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

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  groupedTransactions,
  categoriesMap,
  isCensored,
}) => {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await db.transactions.delete(deleteId);
      setDeleteId(null);
    }
  };

  if (groupedTransactions.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center gap-4 opacity-50 mt-4">
        <div className="p-5 bg-secondary/50 rounded-full text-muted-foreground/60">
          <HugeiconsIcon icon={Invoice01Icon} size={28} />
        </div>
        <Typography
          variant="xs"
          weight="semibold"
          muted
          className="tracking-wider"
        >
          Belum ada transaksi
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6">
      {groupedTransactions.map(([dateKey, txs]) => (
        <div key={dateKey} className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <Typography
              variant="small"
              weight="semibold"
              muted
              className="tracking-wide"
            >
              {formatGroupDate(dateKey)}
            </Typography>
            <Typography
              variant="xs"
              weight="semibold"
              className="px-2.5 py-1 glass-card-sm rounded-lg"
            >
              {txs.length} Items
            </Typography>
          </div>

          <div className="space-y-2">
            {txs.map((t: Transaction) => (
              <TransactionItem
                key={t.id}
                t={t}
                categoriesMap={categoriesMap}
                isCensored={isCensored}
                onDeleteRequest={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-[340px] rounded-[2rem] p-8 border-none ring-1 ring-black/5 shadow-2xl bg-background/95 backdrop-blur-2xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-2">
              <HugeiconsIcon icon={Delete02Icon} size={32} />
            </div>
            <DialogTitle className="text-xl font-bold text-center uppercase tracking-tight italic">
              Hapus Transaksi?
            </DialogTitle>
            <DialogDescription className="text-center text-xs font-medium opacity-60 px-2 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Transaksi akan dihapus secara
              permanen dari riwayat kamu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 mt-6 sm:flex-col sm:space-x-0">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-destructive/20"
            >
              Hapus Sekarang
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteId(null)}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100"
            >
              Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionHistory;
