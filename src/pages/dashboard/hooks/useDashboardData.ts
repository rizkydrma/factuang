import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Transaction, type Category } from '../../../db/database';
import { ICON_MAP, DEFAULT_ICON } from '@/constants/icons';
import { HugeiconsIcon } from '@hugeicons/react';

export const useDashboardData = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const liveCategories = useLiveQuery(() => db.categories.toArray());
  const categories = useMemo(() => liveCategories || [], [liveCategories]);

  const liveTransactions = useLiveQuery(
    () =>
      db.transactions
        .filter((t) => {
          const tDate = new Date(t.date);
          const monthStart = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1,
          );
          const monthEnd = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 2,
            0,
          );
          return tDate >= monthStart && tDate <= monthEnd;
        })
        .toArray(),
    [currentDate],
  );

  const transactions = useMemo<Transaction[]>(
    () => liveTransactions || [],
    [liveTransactions],
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions],
  );

  const categoriesMap = useMemo(
    () => new Map<string, Category>(categories.map((c) => [c.name, c])),
    [categories],
  );

  const categorySummaries = useMemo(() => {
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
  }, [transactions, categoriesMap]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    [...transactions].reverse().forEach((t) => {
      const dateObj = new Date(t.date);
      const isoKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      if (!groups[isoKey]) groups[isoKey] = [];
      groups[isoKey].push(t);
    });

    return Object.entries(groups).sort(([keyA], [keyB]) =>
      keyB.localeCompare(keyA),
    );
  }, [transactions]);

  const changeMonth = (delta: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(currentDate.getMonth() + delta);
    setCurrentDate(nextDate);
  };

  const monthYear = currentDate.toLocaleString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return {
    currentDate,
    setCurrentDate,
    monthYear,
    transactions,
    totalExpense,
    categorySummaries,
    groupedTransactions,
    categoriesMap,
    changeMonth,
  };
};
