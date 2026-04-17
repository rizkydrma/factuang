import { DEFAULT_ICON, ICON_MAP } from '@/constants/icons';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';
import {
  Invoice01Icon,
  ViewIcon,
  ViewOffIcon,
  UserIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useLiveQuery } from 'dexie-react-hooks';
import React, { useMemo, useState } from 'react';
import { db } from '../db/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

const Dashboard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCensored, setIsCensored] = useState(false);
  const [tempName, setTempName] = useState('');

  const { userName, setUserName } = useUserStore();
  const isNameModalOpen = userName === null;

  const monthYear = currentDate.toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const liveCategories = useLiveQuery(() => db.categories.toArray());
  const categories = useMemo(() => liveCategories || [], [liveCategories]);

  const liveTransactions = useLiveQuery(
    () =>
      db.transactions
        .filter((t) => {
          const tDate = new Date(t.date);
          return (
            tDate.getMonth() === currentDate.getMonth() &&
            tDate.getFullYear() === currentDate.getFullYear()
          );
        })
        .toArray(),
    [currentDate],
  );

  const transactions = useMemo(
    () => liveTransactions || [],
    [liveTransactions],
  );

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const changeMonth = (delta: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(currentDate.getMonth() + delta);
    setCurrentDate(nextDate);
  };

  const handleSaveName = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
  };

  // Aggregate category summaries
  const categorySummaries = useMemo(() => {
    const categoriesMap = new Map<string, (typeof categories)[0]>(
      categories.map((c) => [c.name, c]),
    );
    const summaries: Record<
      string,
      {
        total: number;
        icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
        color: string;
      }
    > = {};

    transactions.forEach((t) => {
      if (t.type === 'expense') {
        if (!summaries[t.category]) {
          const canonical = categoriesMap.get(t.category);
          summaries[t.category] = {
            total: 0,
            icon: canonical?.icon
              ? ICON_MAP[canonical.icon] || DEFAULT_ICON
              : t.categoryIcon
                ? ICON_MAP[t.categoryIcon] || DEFAULT_ICON
                : DEFAULT_ICON,
            color: canonical?.color || t.categoryColor || 'bg-slate-500',
          };
        }
        summaries[t.category].total += t.amount;
      }
    });

    return Object.entries(summaries)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [transactions, categories]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    [...transactions].reverse().forEach((t) => {
      const dateObj = new Date(t.date);
      // Create stable key YYYY-MM-DD local time for grouping
      const isoKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      if (!groups[isoKey]) groups[isoKey] = [];
      groups[isoKey].push(t);
    });

    // Sort keys descending (newest groups first)
    return Object.entries(groups).sort(([keyA], [keyB]) =>
      keyB.localeCompare(keyA),
    );
  }, [transactions]);

  const categoriesMap = useMemo(
    () => new Map(categories.map((c) => [c.name, c])),
    [categories],
  );

  const formatGroupDate = (isoKey: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (isoKey === todayKey) return 'Hari ini';
    if (isoKey === yesterdayKey) return 'Kemarin';

    const d = new Date(isoKey);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Section */}
      <section className="bg-linear-150 from-primary to-primary/80 px-6 pt-12 pb-2 rounded-b-2xl shadow-sm flex flex-col space-y-8 text-primary-foreground relative overflow-hidden">
        {/* Decorative Background for standard aesthetic */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Header - Name & Nav */}
        <div className="flex items-center justify-between relative z-10 w-full pt-2">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-base font-semibold tracking-tight truncate">
              Hi, {userName || '...'}
            </h1>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold shrink-0 bg-primary-foreground/10 backdrop-blur-md rounded-full px-1.5 py-0.5 border border-primary-foreground/20">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors active:scale-95 flex items-center justify-center"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={12}
                strokeWidth={2.5}
              />
            </button>
            <span className="w-[75px] text-center truncate">{monthYear}</span>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors active:scale-95 flex items-center justify-center"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={12}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>

        {/* Total Expense */}
        <div className="relative z-10 flex items-end justify-between w-full pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary-foreground/90">
              Total Pengeluaran
            </p>
            <p className="text-[2rem] font-bold tracking-tight leading-none drop-shadow-sm tabular-nums">
              {isCensored ? 'Rp ******' : formatCurrency(totalExpense)}
            </p>
          </div>
          <button
            onClick={() => setIsCensored(!isCensored)}
            className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors mb-0.5 active:scale-95"
            aria-label="Toggle visibility"
          >
            <HugeiconsIcon
              icon={isCensored ? ViewOffIcon : ViewIcon}
              size={24}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* Category Slider - Moved Inside */}
        <div className="relative z-20 w-full">
          {categorySummaries.length > 0 ? (
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
                        <HugeiconsIcon
                          icon={cat.icon}
                          size={18}
                          strokeWidth={2}
                        />
                      </div>
                    </div>
                    <div className="space-y-0.5 mt-2">
                      <p className="text-xs font-semibold text-muted-foreground truncate">
                        {cat.name}
                      </p>
                      <p className="text-sm font-bold  text-white tabular-nums truncate">
                        {isCensored ? 'Rp ******' : formatCurrency(cat.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-10" />
          )}
        </div>
      </section>

      <main className="flex-1 pb-32 pt-6 relative overflow-hidden">
        {/* Decorative background elements for glass effect */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Transactions List */}
        <div className="px-6 space-y-6">
          {groupedTransactions.length > 0 ? (
            groupedTransactions.map(([dateKey, txs]) => (
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
                  {txs.map((t) => {
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
                          {/* Icon Box */}
                          <div
                            className={cn(
                              'w-[42px] h-[42px] rounded-xl border border-white/10 flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95',
                              colorClass,
                              'text-white',
                            )}
                          >
                            <HugeiconsIcon
                              icon={icon}
                              size={20}
                              strokeWidth={2}
                            />
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
                            {isCensored
                              ? 'Rp ******'
                              : formatCurrency(t.amount)}
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
            ))
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-4 opacity-50 mt-4">
              <div className="p-5 bg-secondary/50 rounded-full text-muted-foreground/60">
                <HugeiconsIcon icon={Invoice01Icon} size={28} />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Belum ada transaksi
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Mandatory Name Modal */}
      <Dialog
        open={isNameModalOpen}
        onOpenChange={(open) => {
          if (!open && isNameModalOpen) return;
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-sm rounded-[2rem] p-8"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-5 shadow-inner border border-primary/20">
              <HugeiconsIcon icon={UserIcon} size={32} strokeWidth={2} />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle className="text-xl font-bold tracking-tight">
                Selamat Datang!
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed px-2">
                Silakan masukkan nama panggilan kamu terlebih dahulu untuk mulai
                menggunakan aplikasi.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveName} className="w-full space-y-4 pt-6">
              <Input
                required
                placeholder="Nama kamu..."
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-12 rounded-xl text-center font-medium"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!tempName.trim()}
                className="w-full h-12 rounded-xl text-sm font-bold"
              >
                Simpan & Lanjutkan
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
