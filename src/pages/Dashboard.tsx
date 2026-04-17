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
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700 bg-background transition-colors duration-300">
      {/* Hero Header Section */}
      <section className="px-8 pt-10 pb-12 space-y-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={Activity01Icon} size={24} strokeWidth={3} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-xl font-black tracking-tighter uppercase text-foreground">
                Factuang
              </h1>
              <span className="text-[10px] font-bold text-foreground/20">
                0.0.1
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <HugeiconsIcon
                icon={Search01Icon}
                size={22}
                className="text-foreground/40"
              />
            </button>
            <button className="p-2 hover:bg-secondary rounded-xl transition-colors">
              <HugeiconsIcon
                icon={Settings01Icon}
                size={22}
                className="text-foreground/40"
              />
            </button>
          </div>
        </header>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight capitalize text-foreground">
            {monthYear}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-secondary rounded-full transition-colors flex items-center justify-center text-foreground/60"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={20}
                strokeWidth={2.5}
              />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-secondary rounded-full transition-colors flex items-center justify-center text-foreground/60"
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={20}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
            Total pengeluaran
          </p>
          <p className="text-4xl font-black tracking-tighter text-primary">
            {formatCurrency(totalExpense).replace(',00', '')}
          </p>
        </div>
      </section>

      {/* Content Section Area */}
      <div className="flex-1 px-6 space-y-10">
        {/* Monthly Transaction List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
              Daftar Transaksi
            </h3>
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
              {transactions.length} Item
            </span>
          </div>
          <div className="space-y-3">
            {transactions.length > 0 ? (
              [...transactions].reverse().map((t) => (
                <div
                  key={t.id}
                  className="group relative bg-card border border-border/50 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-secondary text-primary">
                      <HugeiconsIcon
                        icon={Invoice01Icon}
                        size={18}
                        strokeWidth={2.5}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold uppercase tracking-tight text-foreground">
                        {t.category}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">
                          {new Date(t.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        {t.note && (
                          <span className="w-1 h-1 bg-border rounded-full" />
                        )}
                        {t.note && (
                          <p className="text-[9px] text-foreground/50 italic font-medium truncate max-w-[100px]">
                            {t.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-sm font-black tracking-tight text-foreground">
                      {formatCurrency(t.amount).replace(',00', '')}
                    </p>
                    <button
                      onClick={() => t.id && handleDelete(t.id)}
                      className="p-2 text-foreground/20 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all flex items-center justify-center active:scale-90"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center gap-3">
                <div className="p-4 rounded-full bg-secondary/50 text-foreground/10">
                  <HugeiconsIcon icon={Invoice01Icon} size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
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
