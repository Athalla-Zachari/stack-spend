import type { TransactionWithDetails } from "@/db/queries";

export type ChartViewMode = "weeks" | "days";

export interface BarItem {
  id: string;
  shortLabel: string;
  fullLabel: string;
  subLabel: string;
  amount: number;
  heightPercent: number;
  sharePercent: number;
  count: number;
  isPeak: boolean;
}

export interface MonthlyWeeklyStats {
  totalMonthSpending: number;
  avgWeeklySpending: number;
  weeks: BarItem[];
  days: BarItem[];
  peakWeek: BarItem | null;
  peakDay: BarItem | null;
}

const WEEKDAY_LABELS = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
] as const;

export function computeMonthlyWeeklyStats(
  transactions: TransactionWithDetails[],
  year: number,
  monthIndex: number,
  monthName: string,
): MonthlyWeeklyStats {
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const shortMonth = monthName.slice(0, 3);

  const expenses = transactions.filter(
    (tx) =>
      tx.categoryType === "expense" &&
      !tx.relatedPocketId &&
      tx.transactionDate.startsWith(monthPrefix),
  );

  const weekRanges: Array<{ start: number; end: number }> = [
    { start: 1, end: Math.min(7, daysInMonth) },
    { start: 8, end: Math.min(14, daysInMonth) },
    { start: 15, end: Math.min(21, daysInMonth) },
    { start: 22, end: Math.min(28, daysInMonth) },
  ];

  if (daysInMonth > 28) {
    weekRanges.push({ start: 29, end: daysInMonth });
  }

  const weekAmounts = new Array<number>(weekRanges.length).fill(0);
  const weekCounts = new Array<number>(weekRanges.length).fill(0);
  const dayAmounts = new Array<number>(7).fill(0);
  const dayCounts = new Array<number>(7).fill(0);

  let totalMonthSpending = 0;

  for (const tx of expenses) {
    const amount = Number(tx.amount || 0);
    if (amount <= 0) continue;

    const parts = tx.transactionDate.split("-");
    const dayOfMonth = parseInt(parts[2] ?? "0", 10);
    if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > daysInMonth) {
      continue;
    }

    totalMonthSpending += amount;

    const weekIdx = Math.min(
      Math.floor((dayOfMonth - 1) / 7),
      weekRanges.length - 1,
    );
    weekAmounts[weekIdx] += amount;
    weekCounts[weekIdx] += 1;

    const jsDay = new Date(Date.UTC(year, monthIndex, dayOfMonth)).getUTCDay();
    const mondayFirstIdx = (jsDay + 6) % 7;
    dayAmounts[mondayFirstIdx] += amount;
    dayCounts[mondayFirstIdx] += 1;
  }

  const maxWeekAmount = Math.max(0, ...weekAmounts);
  const maxDayAmount = Math.max(0, ...dayAmounts);

  const weeks: BarItem[] = weekRanges.map((range, idx) => {
    const amount = weekAmounts[idx];
    const isPeak = maxWeekAmount > 0 && amount === maxWeekAmount;
    const heightPercent =
      maxWeekAmount > 0 ? Math.round((amount / maxWeekAmount) * 100) : 0;
    const sharePercent =
      totalMonthSpending > 0
        ? Math.round((amount / totalMonthSpending) * 100)
        : 0;
    const subLabel =
      range.start === range.end
        ? `${range.start}`
        : `${range.start}-${range.end}`;

    return {
      id: `w-${idx + 1}`,
      shortLabel: `W${idx + 1}`,
      fullLabel: `Week ${idx + 1} (${subLabel} ${shortMonth})`,
      subLabel,
      amount,
      heightPercent,
      sharePercent,
      count: weekCounts[idx],
      isPeak,
    };
  });

  const days: BarItem[] = WEEKDAY_LABELS.map((label, idx) => {
    const amount = dayAmounts[idx];
    const isPeak = maxDayAmount > 0 && amount === maxDayAmount;
    const heightPercent =
      maxDayAmount > 0 ? Math.round((amount / maxDayAmount) * 100) : 0;
    const sharePercent =
      totalMonthSpending > 0
        ? Math.round((amount / totalMonthSpending) * 100)
        : 0;

    return {
      id: `d-${label.short.toLowerCase()}`,
      shortLabel: label.short,
      fullLabel: `${label.full}s in ${shortMonth}`,
      subLabel: `${dayCounts[idx]}x`,
      amount,
      heightPercent,
      sharePercent,
      count: dayCounts[idx],
      isPeak,
    };
  });

  const peakWeek = weeks.find((w) => w.isPeak) ?? null;
  const peakDay = days.find((d) => d.isPeak) ?? null;
  // Normalize by actual 7-day weeks in the month so 29-31 day months do not under-report weekly pace.
  const avgWeeklySpending =
    daysInMonth > 0 ? Math.round(totalMonthSpending / (daysInMonth / 7)) : 0;

  return {
    totalMonthSpending,
    avgWeeklySpending,
    weeks,
    days,
    peakWeek,
    peakDay,
  };
}
