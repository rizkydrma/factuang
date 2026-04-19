import React, { useState } from 'react';
import { useUserStore } from '@/store/userStore';

import { motion, AnimatePresence } from 'framer-motion';

// Components
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardSummary } from './components/DashboardSummary';
import { CategorySlider } from './components/CategorySlider';
import TransactionHistory from './components/TransactionHistory';
import { ReportView } from './components/ReportView';
import { NameOnboardingModal } from './components/NameOnboardingModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Hooks
import { useDashboardData } from './hooks/useDashboardData';

const Dashboard: React.FC = () => {
  const [isCensored, setIsCensored] = useState(false);
  const { userName, setUserName } = useUserStore();

  const {
    currentDate,
    monthYear,
    transactions,
    totalExpense,
    categorySummaries,
    groupedTransactions,
    categoriesMap,
    changeMonth,
  } = useDashboardData();

  const isNameModalOpen = userName === null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Top Section */}
      <section className="bg-linear-150 from-primary to-primary px-6 pt-12 pb-2 rounded-b-2xl shadow-sm flex flex-col space-y-8 text-primary-foreground relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />

        <DashboardHeader
          userName={userName}
          monthYear={monthYear}
          onChangeMonth={changeMonth}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={monthYear}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col space-y-8"
          >
            <DashboardSummary
              totalExpense={totalExpense}
              isCensored={isCensored}
              onToggleCensored={() => setIsCensored(!isCensored)}
            />

            <CategorySlider
              categorySummaries={categorySummaries}
              isCensored={isCensored}
            />
          </motion.div>
        </AnimatePresence>
      </section>

      <main className="flex-1 pb-32 pt-6 relative overflow-hidden">
        <Tabs defaultValue="recent" className="px-6">
          <TabsList className="w-full mb-6 p-1.5 bg-muted/40 backdrop-blur-md rounded-md border border-border/50">
            <TabsTrigger
              value="recent"
              className="flex-1 gap-2 py-3.5 rounded-md transition-all duration-300 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-lg data-active:shadow-primary/30"
            >
              <span className="font-semibold">Transaksi Terbaru</span>
            </TabsTrigger>
            <TabsTrigger
              value="report"
              className="flex-1 gap-2 py-3.5 rounded-md transition-all duration-300 data-active:bg-primary data-active:text-primary-foreground data-active:shadow-lg data-active:shadow-primary/30"
            >
              <span className="font-semibold">Laporan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="outline-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={monthYear}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <TransactionHistory
                  groupedTransactions={groupedTransactions}
                  categoriesMap={categoriesMap}
                  isCensored={isCensored}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="report" className="outline-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${monthYear}-report`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <ReportView
                  transactions={transactions}
                  currentDate={currentDate}
                  categoriesMap={categoriesMap}
                />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </main>

      <NameOnboardingModal isOpen={isNameModalOpen} onSave={setUserName} />
    </div>
  );
};

export default Dashboard;
