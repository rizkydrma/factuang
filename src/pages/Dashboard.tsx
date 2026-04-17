import { useLiveQuery } from 'dexie-react-hooks';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Activity01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Invoice01Icon,
  Search01Icon,
  Settings01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { db } from '../db/database';

const Dashboard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthYear = currentDate.toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Filter transactions by the current month and year
  const transactions =
    useLiveQuery(
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
    ) || [];

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

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
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700 bg-background">
      {/* Hero Header Section */}
      <section className="bg-background border-b border-border px-8 pt-8 pb-16 space-y-12 transition-colors duration-300">
        <header className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              icon={Activity01Icon}
              size={28}
              strokeWidth={3}
              className="text-primary"
            />
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-xl font-black tracking-tighter uppercase">
                Factuang
              </h1>
              <span className="text-[10px] font-bold opacity-30">0.0.1</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <HugeiconsIcon
              icon={Search01Icon}
              size={24}
              className="opacity-50"
            />
            <HugeiconsIcon
              icon={Settings01Icon}
              size={24}
              className="opacity-50"
            />
          </div>
        </header>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight capitalize">
            {monthYear}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-secondary rounded-full transition-colors flex items-center justify-center"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={24}
                strokeWidth={2.5}
              />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-secondary rounded-full transition-colors flex items-center justify-center"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={24}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium opacity-50 tracking-wide">
            Total pengeluaran
          </p>
          <p className="text-3xl font-black tracking-tighter text-primary">
            {formatCurrency(totalExpense).replace(',00', '')}
          </p>
        </div>
      </section>

      {/* Content Section Area */}
      <div className="flex-1 bg-background px-6 pt-10 pb-8 space-y-10 transition-colors duration-300">
        {/* Monthly Transaction List */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/40">
              Daftar Transaksi
            </h3>
            <span className="text-[10px] font-bold text-primary bg-secondary/20 px-2 py-0.5 rounded-full">
              {transactions.length} Item
            </span>
          </div>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              [...transactions].reverse().map((t) => (
                <div
                  key={t.id}
                  className="group relative bg-card border border-secondary/30 p-4 rounded-2xl flex items-center justify-between shadow-sm shadow-secondary/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-secondary/20 text-primary">
                      <HugeiconsIcon
                        icon={Invoice01Icon}
                        size={18}
                        strokeWidth={2.5}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-black uppercase tracking-tight text-foreground">
                        {t.category}
                      </p>
                      <p className="text-[9px] text-foreground/40 font-black uppercase tracking-widest">
                        {new Date(t.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      {t.note && (
                        <p className="text-[9px] text-foreground/60 italic font-medium truncate max-w-[120px]">
                          {t.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-xs font-black tracking-tighter text-foreground">
                      {formatCurrency(t.amount).replace(',00', '')}
                    </p>
                    <button
                      onClick={() => t.id && handleDelete(t.id)}
                      className="p-1 text-foreground/10 hover:text-destructive transition-all flex items-center justify-center"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-secondary rounded-3xl">
                <p className="text-xs font-black uppercase tracking-widest text-foreground/20">
                  Belum ada transaksi
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
