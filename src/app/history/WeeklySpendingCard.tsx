"use client";

import { useState, useMemo } from "react";
import { Minus, TrendingUp } from "lucide-react";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";

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
  avgDailySpending: number;
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
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
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

    const jsDay = new Date(year, monthIndex, dayOfMonth).getDay();
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
  const avgWeeklySpending =
    weeks.length > 0 ? Math.round(totalMonthSpending / weeks.length) : 0;
  const avgDailySpending =
    daysInMonth > 0 ? Math.round(totalMonthSpending / daysInMonth) : 0;

  return {
    totalMonthSpending,
    avgWeeklySpending,
    avgDailySpending,
    weeks,
    days,
    peakWeek,
    peakDay,
  };
}

interface WeeklySpendingCardProps {
  transactions: TransactionWithDetails[];
  year: number;
  monthIndex: number;
  monthName: string;
  className?: string;
}

export function WeeklySpendingCard({
  transactions,
  year,
  monthIndex,
  monthName,
  className = "",
}: WeeklySpendingCardProps) {
  const [viewMode, setViewMode] = useState<ChartViewMode>("weeks");
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);

  const stats = useMemo(
    () => computeMonthlyWeeklyStats(transactions, year, monthIndex, monthName),
    [transactions, year, monthIndex, monthName],
  );

  const activeBars = viewMode === "weeks" ? stats.weeks : stats.days;
  const selectedBar =
    activeBars.find((bar) => bar.id === selectedBarId) ?? null;

  const headlineLabel = selectedBar
    ? selectedBar.fullLabel
    : "Avg. weekly spend";

  const headlineAmount = selectedBar
    ? selectedBar.amount
    : stats.avgWeeklySpending;

  let badgeText = `No expenses in ${monthName}`;
  let BadgeIcon = Minus;

  if (selectedBar) {
    BadgeIcon = selectedBar.amount > 0 ? TrendingUp : Minus;
    badgeText =
      selectedBar.amount > 0
        ? `${selectedBar.sharePercent}% of ${monthName.slice(0, 3)} (${selectedBar.count} tx)`
        : `0 spent in ${selectedBar.shortLabel}`;
  } else if (stats.totalMonthSpending > 0) {
    BadgeIcon = TrendingUp;
    if (viewMode === "weeks" && stats.peakWeek) {
      badgeText = `Peak: ${stats.peakWeek.shortLabel} (${stats.peakWeek.sharePercent}% of month)`;
    } else if (viewMode === "days" && stats.peakDay) {
      badgeText = `Highest on ${stats.peakDay.shortLabel} (${stats.peakDay.sharePercent}% of month)`;
    }
  }

  const handleModeChange = (mode: ChartViewMode) => {
    setViewMode(mode);
    setSelectedBarId(null);
  };

  const handleBarClick = (id: string) => {
    setSelectedBarId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-label="Weekly and daily spending habits"
      className={`w-full rounded-2xl bg-teal-mid p-4.5 border border-grey300/20 shadow-xs flex flex-col gap-3.5 ${className}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <span className="text-grey300 text-xs sm:text-sm font-medium truncate">
            {headlineLabel}
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-grey100 tracking-tight truncate">
            IDR {headlineAmount.toLocaleString("id-ID")}
          </p>
          <span className="bg-lime px-2.5 py-1 rounded-full text-xs text-teal-deep font-semibold inline-flex items-center gap-1.5 w-fit max-w-full">
            <BadgeIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{badgeText}</span>
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Spending breakdown mode"
          className="bg-teal-deep/60 p-1 rounded-xl border border-grey300/15 flex items-center gap-1 shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "weeks"}
            onClick={() => handleModeChange("weeks")}
            className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-lime ${
              viewMode === "weeks"
                ? "bg-lime text-teal-deep"
                : "text-grey100 hover:bg-teal/40"
            }`}
          >
            Weeks
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "days"}
            onClick={() => handleModeChange("days")}
            className={` px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-lime ${
              viewMode === "days"
                ? "bg-lime text-teal-deep"
                : "text-grey100 hover:bg-teal/40"
            }`}
          >
            Days
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-grey300/15 flex flex-col gap-2">
        <div
          role="group"
          aria-label={
            viewMode === "weeks"
              ? `Weekly spending bars for ${monthName} ${year}`
              : `Day of week spending bars for ${monthName} ${year}`
          }
          className="grid gap-1.5 sm:gap-2 items-end"
          style={{
            gridTemplateColumns: `repeat(${activeBars.length}, minmax(0, 1fr))`,
          }}
        >
          {activeBars.map((bar) => {
            const isSelected = selectedBarId === bar.id;
            const isHighlighted = selectedBarId ? isSelected : bar.isPeak;
            const barHeightPx =
              bar.amount > 0
                ? Math.max(10, Math.round((bar.heightPercent / 100) * 68))
                : 4;

            return (
              <button
                key={bar.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${bar.fullLabel}: IDR ${bar.amount.toLocaleString("id-ID")}`}
                onClick={() => handleBarClick(bar.id)}
                className={`min-h-11 flex flex-col items-center justify-end gap-1.5 rounded-xl py-1.5 px-1 cursor-pointer transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-lime ${
                  isSelected
                    ? "bg-teal-deep/55 ring-1 ring-lime/70"
                    : "hover:bg-teal-deep/35"
                }`}
              >
                <span className="text-[11px] font-semibold text-grey100 leading-none">
                  {bar.amount > 0 ? `${bar.sharePercent}%` : ""}
                </span>

                <div className="w-full h-17 flex items-end justify-center px-1">
                  <div
                    style={{ height: `${barHeightPx}px` }}
                    className={`w-full max-w-7 rounded-t-md rounded-b-xs transition-all duration-200 motion-reduce:transition-none ${
                      bar.amount === 0
                        ? "bg-grey300/25"
                        : isHighlighted
                          ? "bg-lime"
                          : "bg-aqua-light/85"
                    }`}
                  />
                </div>

                <span
                  className={`text-xs font-bold leading-none ${
                    isHighlighted && bar.amount > 0
                      ? "text-lime"
                      : "text-grey100"
                  }`}
                >
                  {bar.shortLabel}
                </span>
                <span className="text-[11px] text-grey300 leading-none truncate max-w-full">
                  {bar.subLabel}
                </span>
              </button>
            );
          })}
        </div>

        {stats.totalMonthSpending === 0 && (
          <p className="text-xs text-grey300 text-center pt-1">
            No expenses recorded for {monthName} {year}. Add an expense to see
            your weekly and daily patterns.
          </p>
        )}
      </div>
    </section>
  );
}

export function WeeklySpendingCardSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-label="Loading weekly spending chart"
      className={`w-full rounded-2xl bg-teal-mid/30 p-4.5 border border-grey300/20 shadow-xs flex flex-col gap-3.5 ${className}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <Skeleton className="h-4 w-28 rounded-md bg-grey300/30" />
          <Skeleton className="h-8 w-40 rounded-lg bg-grey300/30" />
          <Skeleton className="h-6 w-36 rounded-full bg-grey300/30" />
        </div>
        <Skeleton className="h-11 w-32 rounded-xl bg-grey300/30 shrink-0" />
      </div>
      <div className="pt-3 border-t border-grey300/15 grid grid-cols-5 gap-2 items-end">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-14 w-full max-w-7 rounded-md bg-grey300/30" />
            <Skeleton className="h-3 w-6 rounded bg-grey300/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
