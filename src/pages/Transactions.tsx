import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Transaction } from '../db/database';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Search01Icon } from '@hugeicons/core-free-icons';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { ICON_MAP, DEFAULT_ICON } from '@/constants/icons';
import { Typography } from '@/components/ui/Typography';

// --- Constants & Utilities ---

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
    .format(val)
    .replace(',00', '');
};

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

// --- Sub-components ---

const TransactionRow: React.FC<{
  transaction: Transaction;
  onDelete: (id: number) => void;
}> = ({ transaction: t, onDelete }) => {
  const icon = t.categoryIcon
    ? ICON_MAP[t.categoryIcon] || DEFAULT_ICON
    : DEFAULT_ICON;
  const colorClass = t.categoryColor || 'bg-slate-500';

  return (
    <div className="group flex items-center justify-between py-3.5 px-4 hover:bg-secondary/20 transition-all duration-200">
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-active:scale-95',
            colorClass.replace('bg-', 'bg-') + '/10',
            colorClass.replace('bg-', 'text-'),
          )}
        >
          <HugeiconsIcon icon={icon} size={18} strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <Typography
            variant="small"
            weight="bold"
            className="text-foreground/90 leading-none truncate"
          >
            {t.category}
          </Typography>
          {t.note && (
            <Typography
              variant="xs"
              weight="medium"
              className="text-foreground/40 mt-1 max-w-[180px] truncate"
            >
              {t.note}
            </Typography>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Typography
          variant="small"
          weight="bold"
          mono
          className="text-foreground tracking-tight"
        >
          {formatCurrency(t.amount)}
        </Typography>
        <button
          onClick={() => t.id && onDelete(t.id)}
          className="p-1.5 rounded-lg text-foreground/20 hover:text-destructive hover:bg-destructive/10 transition-all active:scale-90"
        >
          <HugeiconsIcon icon={Delete02Icon} size={14} />
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDelete = async (id: number) => {
    if (confirm('Hapus transaksi ini?')) {
      await db.transactions.delete(id);
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

                <div className="bg-card/40 rounded-[1.5rem] border border-border/10 overflow-hidden shadow-sm shadow-black/2">
                  <div className="divide-y divide-border/10">
                    {items.map((t) => (
                      <TransactionRow
                        key={t.id}
                        transaction={t}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
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
    </div>
  );
};

export default Transactions;
