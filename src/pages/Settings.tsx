import React, { useEffect, useState } from 'react';
import { db } from '../db/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Download01Icon,
  Upload01Icon,
  Moon01Icon,
  Sun01Icon,
  Delete02Icon,
  InformationCircleIcon,
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const exportToCSV = async () => {
    const transactions = await db.transactions.toArray();
    if (transactions.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['ID', 'Type', 'Amount', 'Category', 'Date', 'Note'];
    const rows = transactions.map((t) => [
      t.id,
      t.type,
      t.amount,
      t.category,
      t.date,
      t.note || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `factuang_export_${new Date().toISOString().split('T')[0]}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n');

      const newTransactions: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const cells = lines[i]
          .split(',')
          .map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"'));

        if (cells.length >= 5) {
          newTransactions.push({
            type: cells[1] as 'expense',
            amount: Number(cells[2]),
            category: cells[3],
            date: cells[4],
            note: cells[5] || '',
          });
        }
      }

      if (newTransactions.length > 0) {
        try {
          await db.transactions.bulkAdd(newTransactions);
          alert(`Successfully imported ${newTransactions.length} transactions`);
        } catch (err) {
          console.error(err);
          alert('Error importing data. Check console for details.');
        }
      } else {
        alert('No valid transactions found in file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const resetAllData = async () => {
    if (
      confirm(
        'Are you SURE? This will delete ALL transactions and categories. This cannot be undone!',
      )
    ) {
      await db.transactions.clear();
      if (confirm('Do you also want to reset categories to default?')) {
        await db.categories.clear();
        window.location.reload();
      } else {
        alert('All transactions have been deleted.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700 pb-20 bg-background text-foreground">
      {/* Page Header */}
      <header className="px-8 pt-8 pb-6 flex items-center justify-between bg-background border-b border-secondary/20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-secondary/20"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} strokeWidth={2.5} />
          </Button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">
              Settings
            </h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">
              Preferences & Data
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Data Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 ml-1">
            Data Management
          </h3>
          <Card className="bg-card border-secondary/30 rounded-3xl overflow-hidden shadow-sm">
            <div className="divide-y divide-secondary/10">
              <button
                onClick={exportToCSV}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-secondary/5 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <HugeiconsIcon icon={Download01Icon} size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-tight">
                      Export to CSV
                    </p>
                    <p className="text-[10px] text-foreground/40 font-medium">
                      Backup your transactions
                    </p>
                  </div>
                </div>
              </button>

              <label className="w-full px-6 py-5 flex items-center justify-between hover:bg-secondary/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <HugeiconsIcon icon={Upload01Icon} size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-tight">
                      Import from CSV
                    </p>
                    <p className="text-[10px] text-foreground/40 font-medium">
                      Restore from a backup
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={importFromCSV}
                  className="hidden"
                />
              </label>

              <button
                onClick={resetAllData}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-rose-500/5 transition-colors text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <HugeiconsIcon icon={Delete02Icon} size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-tight text-rose-500">
                      Reset & Delete All
                    </p>
                    <p className="text-[10px] text-foreground/40 font-medium">
                      Wipe all application data
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </Card>
        </section>

        {/* Appearance Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 ml-1">
            Appearance
          </h3>
          <Card className="bg-card border-secondary/30 rounded-3xl overflow-hidden shadow-sm">
            <button
              onClick={toggleTheme}
              className="w-full px-6 py-5 flex items-center justify-between hover:bg-secondary/5 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                  <HugeiconsIcon
                    icon={theme === 'light' ? Moon01Icon : Sun01Icon}
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-tight">
                    Theme Mode
                  </p>
                  <p className="text-[10px] text-foreground/40 font-medium">
                    Switch to {theme === 'light' ? 'Dark' : 'Light'} mode
                  </p>
                </div>
              </div>
              <div className="w-12 h-6 bg-secondary/30 rounded-full relative p-1 transition-colors">
                <div
                  className={cn(
                    'w-4 h-4 rounded-full transition-all duration-300',
                    theme === 'dark' ? 'bg-primary ml-6' : 'bg-white ml-0',
                  )}
                />
              </div>
            </button>
          </Card>
        </section>

        {/* About Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 ml-1">
            About App
          </h3>
          <Card className="bg-card border-secondary/30 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4 text-card-foreground">
            <div className="p-4 rounded-3xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={InformationCircleIcon} size={32} />
            </div>
            <div>
              <p className="text-lg font-black uppercase tracking-tighter">
                Factuang
              </p>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                Version 0.0.1
              </p>
            </div>
            <p className="text-xs font-medium px-4 opacity-60">
              A simple and modern way to track your daily expenses. Built with
              React, Dexie, and Hugeicons.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Settings;
