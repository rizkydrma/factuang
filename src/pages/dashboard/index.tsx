import React, { useState } from 'react';
import { useUserStore } from '@/store/userStore';

// Components
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardSummary } from './components/DashboardSummary';
import { CategorySlider } from './components/CategorySlider';
import TransactionHistory from './components/TransactionHistory';
import { NameOnboardingModal } from './components/NameOnboardingModal';

// Hooks
import { useDashboardData } from './hooks/useDashboardData';

const Dashboard: React.FC = () => {
  const [isCensored, setIsCensored] = useState(false);
  const { userName, setUserName } = useUserStore();

  const {
    monthYear,
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

        <DashboardSummary
          totalExpense={totalExpense}
          isCensored={isCensored}
          onToggleCensored={() => setIsCensored(!isCensored)}
        />

        <CategorySlider
          categorySummaries={categorySummaries}
          isCensored={isCensored}
        />
      </section>

      <main className="flex-1 pb-32 pt-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <TransactionHistory
          groupedTransactions={groupedTransactions}
          categoriesMap={categoriesMap}
          isCensored={isCensored}
        />
      </main>

      <NameOnboardingModal isOpen={isNameModalOpen} onSave={setUserName} />
    </div>
  );
};

export default Dashboard;
