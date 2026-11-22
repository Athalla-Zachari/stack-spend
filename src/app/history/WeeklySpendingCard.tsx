"use client";

import { useMemo } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCompactWeekRange,
  getWeekStartMonday,
} from "@/lib/date";
import { computeWeeklyDailyStats } from "@/lib/spending-stats";

export { computeWeeklyDailyStats };
export type {
  DayBarItem,
  WeeklyDailyStats,
  WeeklyTrend,
} from "@/lib/spending-stats";

interface WeeklySpendingCardProps {
  transactions: TransactionWithDetails[];
  weekStart: string;
  todayStr: string;
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
  className?: string;
}

export function WeeklySpendingCard({
  transactions,
  weekStart,
  todayStr,
  selectedDate,
  onSelectDate,
  className = "",
}: WeeklySpendingCardProps) {
  const stats = useMemo(
    () => computeWeeklyDailyStats(transactions, weekStart, todayStr),
    [transactions, weekStart, todayStr],
  );

  const selectedBar = selectedDate
    ? (stats.days.find((day) => day.dateStr === selectedDate) ?? null)
    : null;

  const isCurrentWeek = stats.weekStart === getWeekStartMonday(todayStr);
  const compactRange = formatCompactWeekRange(stats.weekStart);

  const headlineLabel = selectedBar
    ? selectedBar.isToday
      ? "Spent today"
      : `Spent on ${selectedBar.fullLabel}`
    : isCurrentWeek
      ? "Spent this week"
      : `Spent ${compactRange}`;

  const headlineAmount = selectedBar
    ? selectedBar.amount
    : stats.totalWeekSpending;

  let badgeText = stats.trend.text;
  let BadgeIcon =
    stats.trend.direction === "up"
      ? TrendingUp
      : stats.trend.direction === "down"
        ? TrendingDown
        : Minus;

  if (selectedBar) {
    BadgeIcon = selectedBar.amount > 0 ? TrendingUp : Minus;
    badgeText =
      selectedBar.amount > 0
        ? `${selectedBar.sharePercent}% of week (${selectedBar.count} tx)`
        : `0 spent on ${selectedBar.fullLabel}`;
  }

  return (
    <section
      aria-label="Weekly spending summary and daily breakdown"
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

        {selectedBar && (
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="min-h-11 px-3 rounded-xl bg-teal-deep/70 hover:bg-teal-deep text-grey100 text-xs font-semibold border border-grey300/20 shrink-0 cursor-pointer transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-lime"
          >
            All week
          </button>
        )}
      </div>

      <div className="pt-3 border-t border-grey300/15 flex flex-col gap-2">
        <div
          role="group"
          aria-label={`Daily spending bars for ${compactRange}`}
          className="grid grid-cols-7 gap-1 sm:gap-2 items-end"
        >
          {stats.days.map((bar) => {
            const isSelected = selectedDate === bar.dateStr;
            const isHighlighted = selectedBar ? isSelected : bar.isPeak;
            const barHeightPx =
              bar.amount > 0
                ? Math.max(10, Math.round((bar.heightPercent / 100) * 68))
                : 4;

            return (
              <button
                key={bar.dateStr}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${bar.fullLabel}: IDR ${bar.amount.toLocaleString("id-ID")}`}
                onClick={() => onSelectDate(isSelected ? null : bar.dateStr)}
                className={`min-h-11 flex flex-col items-center justify-end gap-1.5 rounded-xl py-1.5 px-0.5 sm:px-1 cursor-pointer transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-lime ${
                  isSelected
                    ? "bg-teal-deep/55 ring-1 ring-lime/70"
                    : "hover:bg-teal-deep/35"
                }`}
              >
                <span className="text-[11px] font-semibold text-grey100 leading-none min-h-3">
                  {bar.amount > 0 ? `${bar.sharePercent}%` : ""}
                </span>

                <div className="w-full h-17 flex items-end justify-center px-0.5 sm:px-1">
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
                <span
                  className={`text-[11px] leading-none ${
                    bar.isToday
                      ? "text-lime font-semibold underline underline-offset-2"
                      : "text-grey300"
                  }`}
                >
                  {bar.dayNumber}
                </span>
              </button>
            );
          })}
        </div>

        {stats.totalWeekSpending === 0 && (
          <p className="text-xs text-grey300 text-center pt-1">
            No expenses recorded for {compactRange}. Add an expense to see daily
            spending.
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
      </div>
      <div className="pt-3 border-t border-grey300/15 grid grid-cols-7 gap-1.5 sm:gap-2 items-end">
        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
          <div key={item} className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-14 w-full max-w-7 rounded-md bg-grey300/30" />
            <Skeleton className="h-3 w-6 rounded bg-grey300/30" />
            <Skeleton className="h-2.5 w-4 rounded bg-grey300/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
