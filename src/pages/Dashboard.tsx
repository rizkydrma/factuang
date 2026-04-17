import PageHeader from '@/components/PageHeader';
import { DEFAULT_ICON, ICON_MAP } from '@/constants/icons';
import { cn } from '@/lib/utils';
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  Invoice01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useLiveQuery } from 'dexie-react-hooks';
import React, { useMemo, useState } from 'react';
import { db } from '../db/database';

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

  const monthYear = currentDate.toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

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

  const handleDelete = async (id: number) => {
    if (confirm('Hapus transaksi ini?')) {
      await db.transactions.delete(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in  bg-background transition-colors duration-300">
      <PageHeader
        title="Factuang"
        subtitle="Financial Overview"
        leftAction={
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white border border-white/10 shadow-inner">
            <HugeiconsIcon icon={UserIcon} size={20} />
          </div>
        }
      />

      <main className="flex-1">
        {/* Summary Section */}
        <section className="relative px-8 pt-8 pb-12 space-y-10 bg-linear-to-br from-primary via-blue-600 to-indigo-600 dark:from-primary dark:via-blue-800 dark:to-indigo-950 rounded-b-[2.5rem] shadow-xl shadow-primary/20 overflow-hidden">
          {/* Subtle Background Glow Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-black/10 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight capitalize text-white italic drop-shadow-sm">
              {monthYear}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all flex items-center justify-center text-white active:scale-90 border border-white/10 shadow-inner"
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={20}
                  strokeWidth={2.5}
                />
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all flex items-center justify-center text-white active:scale-90 border border-white/10 shadow-inner"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={20}
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>

          <div className="relative space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
              Total Pengeluaran
            </p>
            <p className="text-5xl font-black tracking-tighter text-white drop-shadow-lg">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </section>

        {/* Content Section Area */}
        <div className="px-6 space-y-8 pb-32">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
                Transaksi Bulan Ini
              </h3>
              <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/5">
                {transactions.length} Item
              </span>
            </div>

            <div className="bg-card/40 rounded-[1.5rem] border border-border/10 overflow-hidden shadow-sm shadow-black/2">
              <div className="divide-y divide-border/10">
                {transactions.length > 0 ? (
                  [...transactions].reverse().map((t) => {
                    const icon = t.categoryIcon
                      ? ICON_MAP[t.categoryIcon] || DEFAULT_ICON
                      : DEFAULT_ICON;
                    const colorClass = t.categoryColor || 'bg-slate-500';

                    return (
                      <div
                        key={t.id}
                        className="group flex items-center justify-between py-3.5 px-4 hover:bg-secondary/20 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                              colorClass.replace('bg-', 'bg-') + '/10',
                              colorClass.replace('bg-', 'text-'),
                            )}
                          >
                            <HugeiconsIcon
                              icon={icon}
                              size={18}
                              strokeWidth={2.5}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-foreground/90 leading-none truncate">
                              {t.category}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-wider whitespace-nowrap">
                                {new Date(t.date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </p>
                              {t.note && (
                                <span className="w-0.5 h-2 bg-border/50 rounded-full" />
                              )}
                              {t.note && (
                                <p className="text-[9px] text-foreground/50 italic font-medium truncate max-w-[120px]">
                                  {t.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <p className="text-[13px] font-black tracking-tight text-foreground">
                            {formatCurrency(t.amount)}
                          </p>
                          <button
                            onClick={() => t.id && handleDelete(t.id)}
                            className="p-2 text-foreground/20 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all flex items-center justify-center active:scale-90"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center flex flex-col items-center justify-center gap-3 opacity-20">
                    <div className="p-8 bg-secondary rounded-full">
                      <HugeiconsIcon icon={Invoice01Icon} size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Belum ada transaksi
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
