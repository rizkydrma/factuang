import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Transaction } from '../db/database';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  Search01Icon,
  Invoice01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  FilterIcon,
  Tag01Icon,
  SpoonAndForkIcon,
  Car01Icon,
  ShoppingBag01Icon,
  FavouriteIcon,
  PackageIcon,
  Coffee01Icon,
  Home01Icon,
  FlashIcon,
  Airplane01Icon,
  GiftIcon,
  Dumbbell01Icon,
  Pizza01Icon,
  Briefcase01Icon,
  Camera01Icon,
  MusicNote01Icon,
  GlobeIcon,
  Joystick01Icon,
  Certificate01Icon,
} from '@hugeicons/core-free-icons';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// --- Types & Constants ---

const ICON_MAP: Record<string, any> = {
  Utensils: SpoonAndForkIcon,
  Car: Car01Icon,
  ShoppingBag: ShoppingBag01Icon,
  Receipt: Invoice01Icon,
  Gamepad2: Joystick01Icon,
  HeartPulse: FavouriteIcon,
  GraduationCap: Certificate01Icon,
  Heart: FavouriteIcon,
  Box: PackageIcon,
  Coffee: Coffee01Icon,
  Home: Home01Icon,
  Zap: FlashIcon,
  Plane: Airplane01Icon,
  Gift: GiftIcon,
  Dumbbell: Dumbbell01Icon,
  Pizza: Pizza01Icon,
  Briefcase: Briefcase01Icon,
  Camera: Camera01Icon,
  Music: MusicNote01Icon,
  Globe: GlobeIcon,
};

// --- Utilities ---

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
    ? ICON_MAP[t.categoryIcon] || Tag01Icon
    : Tag01Icon;
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
          <p className="text-[13px] font-bold text-foreground/90 leading-none truncate">
            {t.category}
          </p>
          {t.note && (
            <p className="text-[10px] text-foreground/40 font-medium truncate mt-1 max-w-[180px]">
              {t.note}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="text-[13px] font-black tracking-tight text-foreground">
          {formatCurrency(t.amount)}
        </p>
        <button
          onClick={() => t.id && onDelete(t.id)}
          className="p-2 rounded-lg text-foreground/20 hover:text-destructive hover:bg-destructive/10 transition-all flex items-center justify-center active:scale-90"
        >
          <HugeiconsIcon icon={Delete02Icon} size={14} />
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Data Fetching
  const transactions =
    useLiveQuery(
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
    ) || [];

  // Grouping Logic
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

  const totalFiltered = useMemo(
    () => transactions.reduce((acc, t) => acc + t.amount, 0),
    [transactions],
  );

  const handleDelete = async (id: number) => {
    if (confirm('Hapus transaksi ini?')) {
      await db.transactions.delete(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      {/* Editorial Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 pt-8 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-secondary rounded-full text-foreground/60 transition-colors flex items-center justify-center"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">
                History
              </h1>
              <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mt-1">
                Records Found: {transactions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/5">
            <HugeiconsIcon
              icon={FilterIcon}
              size={12}
              className="text-primary"
            />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
              {formatCurrency(totalFiltered)}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors"
          />
          <Input
            placeholder="Search category or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-11 bg-secondary/30 border-transparent rounded-2xl text-[11px] font-bold focus-visible:ring-primary/20 shadow-none placeholder:text-foreground/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-32">
        {transactions.length > 0 ? (
          <div className="space-y-10">
            {Object.entries(groupedTransactions).map(([date, items]) => (
              <div key={date} className="space-y-4">
                {/* Date Divider */}
                <div className="flex items-center gap-4 px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 whitespace-nowrap">
                    {formatDateHeader(date)}
                  </h3>
                  <div className="h-px bg-border/40 w-full" />
                </div>

                {/* List Container */}
                <div className="bg-card/40 rounded-[1.5rem] border border-border/10 overflow-hidden shadow-sm shadow-black/[0.02]">
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
            <p className="text-[11px] font-black uppercase tracking-[0.4em]">
              No transactions recorded
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Transactions;
