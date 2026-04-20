import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/Typography';
import { db, type Category, type Transaction } from '@/db/database';
import TransactionHistory from '@/pages/dashboard/components/TransactionHistory';
import { ReportView } from '@/pages/dashboard/components/ReportView';

const Transactions: React.FC = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const liveCategories = useLiveQuery(() => db.categories.toArray());
  const rawTransactions = useLiveQuery(() => db.transactions.toArray());

  const categories = useMemo(() => liveCategories || [], [liveCategories]);
  const liveTransactions = useMemo(
    () => rawTransactions || [],
    [rawTransactions],
  );

  const categoriesMap = useMemo(
    () =>
      new Map<string, Category>(
        categories.map((category) => [category.name, category]),
      ),
    [categories],
  );

  const filteredHistoryTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const sortedTransactions = [...liveTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    if (!query) return sortedTransactions;

    return sortedTransactions.filter(
      (transaction) =>
        transaction.category.toLowerCase().includes(query) ||
        (transaction.note || '').toLowerCase().includes(query),
    );
  }, [liveTransactions, searchTerm]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    filteredHistoryTransactions.forEach((transaction) => {
      const dateObj = new Date(transaction.date);
      const isoKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      if (!groups[isoKey]) groups[isoKey] = [];
      groups[isoKey].push(transaction);
    });

    return Object.entries(groups).sort(([dateA], [dateB]) =>
      dateB.localeCompare(dateA),
    );
  }, [filteredHistoryTransactions]);

  const reportTransactions = useMemo(() => {
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return liveTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });
  }, [currentDate, liveTransactions]);

  const monthYearLabel = currentDate.toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  const changeMonth = (delta: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(currentDate.getMonth() + delta);
    setCurrentDate(nextDate);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-300">
      <PageHeader
        title="Transactions"
        subtitle="Riwayat dan laporan transaksi"
        showBack
      />

      <main className="relative flex-1 overflow-hidden pb-32 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="mb-6 w-full rounded-md border border-border/50 bg-muted/40 p-1.5 backdrop-blur-md">
            <TabsTrigger
              value="history"
              className="flex-1 gap-2 rounded-md py-3.5 transition-all duration-300 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-lg data-active:shadow-primary/30"
            >
              <span className="font-semibold">Riwayat Transaksi</span>
            </TabsTrigger>
            <TabsTrigger
              value="report"
              className="flex-1 gap-2 rounded-md py-3.5 transition-all duration-300 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-lg data-active:shadow-primary/30"
            >
              <span className="font-semibold">Laporan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-5 outline-none">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Cari transaksi..."
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={`history-${searchTerm}-${groupedTransactions.length}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <TransactionHistory
                  groupedTransactions={groupedTransactions}
                  categoriesMap={categoriesMap}
                  isCensored={false}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="report" className="space-y-5 outline-none">
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Previous month"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
              </button>
              <Typography
                variant="small"
                weight="semibold"
                className="capitalize"
              >
                {monthYearLabel}
              </Typography>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Next month"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`report-${monthYearLabel}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <ReportView
                  transactions={reportTransactions}
                  currentDate={currentDate}
                  categoriesMap={categoriesMap}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Transactions;
