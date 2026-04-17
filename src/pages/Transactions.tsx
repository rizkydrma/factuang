import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  Search01Icon,
  Invoice01Icon,
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this transaction?')) {
      await db.transactions.delete(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700 bg-background transition-colors duration-300">
      {/* Page Header */}
      <header className="px-8 pt-10 pb-6 flex items-center justify-between border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-secondary"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} strokeWidth={2.5} />
          </Button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">
              History
            </h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">
              All expenses
            </p>
          </div>
        </div>
        <HugeiconsIcon
          icon={Search01Icon}
          size={24}
          className="text-foreground/20"
        />
      </header>

      <div className="flex-1 p-6 space-y-6">
        <div className="relative group">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 bg-card border-border rounded-2xl focus-visible:ring-primary/20 font-bold placeholder:text-foreground/20 shadow-sm"
          />
        </div>

        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((t) => (
              <Card
                key={t.id}
                className="group relative bg-card border border-border/50 p-5 rounded-[2rem] flex items-center justify-between hover:border-primary/20 transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-secondary text-primary">
                    <HugeiconsIcon
                      icon={Invoice01Icon}
                      size={20}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold uppercase tracking-tight text-foreground">
                      {t.category}
                    </p>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                      {new Date(t.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {t.note && (
                      <p className="text-[10px] text-foreground/50 italic font-medium mt-1 truncate max-w-[150px]">
                        {t.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm font-black tracking-tight text-foreground">
                    {formatCurrency(t.amount).replace(',00', '')}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => t.id && handleDelete(t.id)}
                    className="h-8 w-8 text-foreground/5 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 active:scale-90 flex items-center justify-center"
                    aria-label="Delete"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={16} />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-foreground/10 space-y-4">
              <div className="p-8 bg-card border border-border/50 rounded-[2.5rem] shadow-sm">
                <HugeiconsIcon icon={Search01Icon} size={48} strokeWidth={1} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                No records found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
