import { Invoice01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Typography } from '@/components/ui/Typography';
import React, { useState } from 'react';
import { db, type Category, type Transaction } from '../../../db/database';
import { formatGroupDate } from '../utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TransactionItem from '@/components/TransactionItem';

interface TransactionHistoryProps {
  groupedTransactions: Array<[string, Transaction[]]>;
  categoriesMap: Map<string, Category>;
  isCensored: boolean;
}

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
