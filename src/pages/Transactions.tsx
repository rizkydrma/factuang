import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Transaction } from '../db/database';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Search01Icon } from '@hugeicons/core-free-icons';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import { Typography } from '@/components/ui/Typography';
import TransactionItem from '@/components/TransactionItem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// --- Constants & Utilities ---

const formatDateHeader = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hari Ini';
  if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// --- Main Page Component ---

const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const categories = useLiveQuery(() => db.categories.toArray());
  const categoriesMap = useMemo(() => {
    const map = new Map();
    categories?.forEach((c) => map.set(c.name, c));
    return map;
  }, [categories]);

  const liveTransactions = useLiveQuery(
    () =>
      db.transactions
        .reverse()
        .filter(
          (t) =>
            t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.note || '').toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .toArray(),
    [searchTerm],
  );

  const transactions = useMemo(
    () => liveTransactions || [],
    [liveTransactions],
  );

  const groupedTransactions = useMemo(() => {
    return transactions.reduce(
      (groups, t) => {
        const date = t.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(t);
        return groups;
      },
      {} as Record<string, Transaction[]>,
    );
  }, [transactions]);

  const handleDelete = async () => {
    if (deleteId) {
      await db.transactions.delete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <PageHeader title="History" subtitle="Riwayat Transaksi" showBack />

      <main className="flex-1 p-6 pb-32">
        <div className="mb-8">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search records..."
          />
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-10">
            {Object.entries(groupedTransactions).map(([date, items]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center gap-4 px-2">
                  <Typography
                    variant="xs"
                    weight="bold"
                    className="text-foreground/30 whitespace-nowrap tracking-[0.2em]"
                    as="h3"
                  >
                    {formatDateHeader(date)}
                  </Typography>
                  <div className="h-px bg-border/40 w-full" />
                </div>

                <div className="space-y-2">
                  {items.map((t) => (
                    <TransactionItem
                      key={t.id}
                      t={t}
                      categoriesMap={categoriesMap}
                      isCensored={false}
                      onDeleteRequest={(id) => setDeleteId(id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-20">
            <div className="p-10 bg-secondary rounded-full mb-6">
              <HugeiconsIcon icon={Search01Icon} size={56} strokeWidth={1} />
            </div>
            <Typography variant="xs" weight="bold" className="tracking-[0.4em]">
              No transactions recorded
            </Typography>
          </div>
        )}
      </main>

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

export default Transactions;
