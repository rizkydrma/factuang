import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { type Transaction, type Category } from '../../../db/database';

interface ReportViewProps {
  transactions: Transaction[];
  currentDate: Date;
  categoriesMap: Map<string, Category>;
}

const TAILWIND_COLOR_MAP: Record<string, string> = {
  'bg-rose-500': '#f43f5e',
  'bg-indigo-500': '#6366f1',
  'bg-amber-500': '#f59e0b',
  'bg-emerald-500': '#10b981',
  'bg-purple-500': '#a855f7',
  'bg-rose-400': '#fb7185',
  'bg-cyan-500': '#06b6d4',
  'bg-pink-500': '#ec4899',
  'bg-slate-500': '#64748b',
};

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ReportView: React.FC<ReportViewProps> = ({
  transactions,
  currentDate,
  categoriesMap,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // 1. Half Doughnut Chart Data
  const donutOptions = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    let totalExpenseInDonut = 0;

    transactions.forEach((t) => {
      if (t.type === 'expense') {
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + t.amount;
        totalExpenseInDonut += t.amount;
      }
    });

    const categoriesData = Object.entries(categoryTotals).map(
      ([name, value]) => {
        const cat = categoriesMap.get(name);
        let color = '#94a3b8';
        if (cat?.color && TAILWIND_COLOR_MAP[cat.color]) {
          color = TAILWIND_COLOR_MAP[cat.color];
        } else if (cat?.color?.startsWith('#')) {
          color = cat.color;
        }

        return {
          name,
          value,
          itemStyle: { color },
        };
      },
    );

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        bottom: '0%',
        left: 'center',
        textStyle: { color: 'currentColor', fontSize: 10 },
        itemWidth: 8,
        itemHeight: 8,
        icon: 'circle',
        itemGap: 10,
      },
      series: [
        {
          name: 'Kategori',
          type: 'pie',
          radius: ['70%', '105%'],
          center: ['50%', '85%'],
          startAngle: 180,
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: 'transparent',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: false,
            },
          },
          data: [
            ...categoriesData,
            {
              // Dummy data for the bottom half
              value: totalExpenseInDonut,
              itemStyle: {
                color: 'none',
                decal: { symbol: 'none' },
              },
              label: { show: false },
              tooltip: { show: false },
            },
          ],
        },
      ],
    };
  }, [transactions, categoriesMap]);

  // 2. Heatmap Data (Improved)
  const heatmapOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    transactions.forEach((t) => {
      const dateStr = t.date.split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    const lastDay = new Date(year, month + 1, 0).getDate();
    const data: [string, number][] = [];
    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      data.push([dateStr, counts[dateStr] || 0]);
    }

    const isDark = document.documentElement.classList.contains('dark');

    // Calculate range for the current month
    const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return {
      tooltip: {
        position: 'top',
        formatter: (p: { data: [string, number] }) => {
          const date = new Date(p.data[0]);
          const formattedDate = date.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          return `${formattedDate}<br/>Aktivitas: <b>${p.data[1]} transaksi</b>`;
        },
      },
      visualMap: {
        min: 0,
        max: Math.max(...Object.values(counts), 5),
        calculable: false,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: isDark
            ? ['#262626', '#1e3a8a', '#2563eb', '#3b82f6', '#60a5fa']
            : ['#f8fafc', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'],
        },
        show: false,
      },
      calendar: {
        orient: 'vertical',
        range: [startOfMonth, endOfMonth],
        cellSize: [44, 44],
        left: 'center',
        top: 30,
        itemStyle: {
          borderWidth: 4,
          borderColor: 'transparent',
          color: isDark ? '#262626' : '#f1f5f9',
        },
        yearLabel: { show: false },
        dayLabel: {
          firstDay: 1,
          nameMap: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
          color: 'currentColor',
          margin: 10,
          fontSize: 10,
        },
        monthLabel: { show: false },
        splitLine: { show: false },
      },
      series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data,
        itemStyle: {
          borderRadius: 8,
        },
        label: {
          show: true,
          formatter: (p: { data: [string, number] }) => {
            return new Date(p.data[0]).getDate();
          },
          fontSize: 12,
          fontWeight: 'bold',
          color: 'inherit',
        },
      },
    };
  }, [transactions, month, year]);

  // 3. Stacked Weekly Bar Chart Data (Improved)
  const barOptions = useMemo(() => {
    // Determine the week range (Monday to Sunday) based on weekOffset
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay() || 7; // Sunday=0 -> 7
    startOfWeek.setDate(startOfWeek.getDate() - day + 1 + weekOffset * 7); // Shift to Monday + offset

    const weekDays: string[] = [];
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDates.push(toLocalDateString(d));
      weekDays.push(d.getDate().toString());
    }

    // Aggregate by day and category
    const categoryDayMap: Record<string, Record<string, number>> = {};
    const categoriesInWeek = new Set<string>();

    transactions.forEach((t) => {
      if (t.type === 'expense') {
        const dateStr = t.date.split('T')[0];
        if (weekDates.includes(dateStr)) {
          if (!categoryDayMap[t.category]) categoryDayMap[t.category] = {};
          categoryDayMap[t.category][dateStr] =
            (categoryDayMap[t.category][dateStr] || 0) + t.amount;
          categoriesInWeek.add(t.category);
        }
      }
    });

    // Create series for each category
    const series = Array.from(categoriesInWeek).map((catName) => {
      const cat = categoriesMap.get(catName);
      let color = '#94a3b8';
      if (cat?.color && TAILWIND_COLOR_MAP[cat.color]) {
        color = TAILWIND_COLOR_MAP[cat.color];
      }

      return {
        name: catName,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        itemStyle: { color },
        data: weekDates.map((date) => categoryDayMap[catName]?.[date] || 0),
        barWidth: '40%',
      };
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const list = Array.isArray(params) ? params : [params];
          const dateIndex = list[0].dataIndex;
          const dateStr = weekDates[dateIndex];
          const date = new Date(dateStr);
          const fullDate = date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          let res = `<div style="font-weight: bold; border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 4px; margin-bottom: 4px;">${fullDate}</div>`;
          let total = 0;
          list.forEach((p: any) => {
            if (p.value > 0) {
              res += `<div style="display: flex; justify-content: space-between; gap: 16px;">
                <span>${p.seriesName}:</span>
                <span style="font-family: monospace;">Rp ${p.value.toLocaleString('id-ID')}</span>
              </div>`;
              total += p.value;
            }
          });
          res += `<div style="display: flex; justify-content: space-between; gap: 16px; margin-top: 4px; pt-4; border-top: 1px solid rgba(128,128,128,0.2); font-weight: bold;">
            <span>Total:</span>
            <span>Rp ${total.toLocaleString('id-ID')}</span>
          </div>`;
          return res;
        },
      },
      legend: {
        bottom: '0%',
        left: 'center',
        textStyle: { color: 'currentColor', fontSize: 10 },
        itemWidth: 8,
        itemHeight: 8,
        icon: 'circle',
        itemGap: 10,
        data: Array.from(categoriesInWeek),
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '10%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: weekDays,
          axisTick: { show: false },
          axisLabel: {
            color: 'currentColor',
            fontSize: 11,
            fontWeight: '500',
            interval: 0,
          },
          axisLine: { lineStyle: { color: 'rgba(128,128,128,0.2)' } },
        },
      ],
      yAxis: [
        {
          type: 'value',
          splitNumber: 6,
          axisLabel: {
            color: 'currentColor',
            fontSize: 10,
            formatter: (value: number) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
              return value;
            },
          },
          splitLine: {
            lineStyle: { color: 'rgba(128,128,128,0.05)', type: 'dashed' },
          },
        },
      ],
      series: series,
    };
  }, [transactions, currentDate, categoriesMap, weekOffset]);

  // Logic to check if a week offset is within the current month
  const isOffsetInMonth = (offset: number) => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay() || 7;
    startOfWeek.setDate(startOfWeek.getDate() - day + 1 + offset * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    // If any part of the week is in the month
    return startOfWeek <= monthEnd && endOfWeek >= monthStart;
  };

  const handleWeekChange = (newOffset: number) => {
    if (isOffsetInMonth(newOffset)) {
      setWeekOffset(newOffset);
    }
  };

  return (
    <div className="flex flex-col space-y-12 pb-10">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-1 text-foreground/80">
          Distribusi Kategori
        </h3>
        <div className="h-[220px] w-full">
          <ReactECharts
            option={donutOptions}
            style={{ height: '100%', width: '100%' }}
            theme={
              document.documentElement.classList.contains('dark') ? 'dark' : ''
            }
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-1 text-foreground/80">
          Aktivitas Transaksi
        </h3>
        <div className="h-[300px] w-full">
          <ReactECharts
            option={heatmapOptions}
            style={{ height: '100%', width: '100%' }}
            theme={
              document.documentElement.classList.contains('dark') ? 'dark' : ''
            }
            opts={{ renderer: 'svg' }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-foreground/80">
            Pengeluaran Harian
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleWeekChange(weekOffset - 1)}
              className={`p-2 rounded-full transition-all ${!isOffsetInMonth(weekOffset - 1) ? 'opacity-20 cursor-not-allowed' : 'hover:bg-muted text-foreground/60 active:scale-90'}`}
              disabled={!isOffsetInMonth(weekOffset - 1)}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={24} />
            </button>
            <button
              onClick={() => handleWeekChange(weekOffset + 1)}
              className={`p-2 rounded-full transition-all ${!isOffsetInMonth(weekOffset + 1) ? 'opacity-20 cursor-not-allowed' : 'hover:bg-muted text-foreground/60 active:scale-90'}`}
              disabled={!isOffsetInMonth(weekOffset + 1)}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={24} />
            </button>
          </div>
        </div>

        <div className="h-[300px] w-full relative">
          <ReactECharts
            option={barOptions}
            style={{ height: '100%', width: '100%' }}
            theme={
              document.documentElement.classList.contains('dark') ? 'dark' : ''
            }
            opts={{ renderer: 'svg' }}
            notMerge={false}
          />
        </div>
      </div>
    </div>
  );
};
