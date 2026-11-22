"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { PeriodNavigator } from "@/components/ui/period-navigator";
import {
  TransactionList,
  TransactionListSkeleton,
} from "@/components/TransactionList";
import {
  formatCompactWeekRange,
  formatShortWeekdayDate,
  formatWeekRangeLabel,
  getJakartaDateString,
  getWeekStartMonday,
  parseDateString,
  shiftDateString,
} from "@/lib/date";
import {
  WeeklySpendingCard,
  WeeklySpendingCardSkeleton,
} from "./WeeklySpendingCard";

interface HistoryContainerProps {
  transactions: TransactionWithDetails[];
  todayStr?: string;
  limit?: number;
  showSeeAll?: boolean;
  showFilter?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  showEntryLength?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

export default function HistoryContainer({
  transactions,
  todayStr,
  limit = 5,
  showSeeAll = false,
  showFilter = false,
  showHeader = true,
  headerTitle = "Transaction History",
  showEntryLength = false,
  emptyTitle,
  emptyMessage,
}: HistoryContainerProps) {
  const searchParams = useSearchParams();
  const selectedPocket = searchParams.get("pocket");

  const resolvedTodayStr = todayStr ?? getJakartaDateString();
  const currentWeekStart = getWeekStartMonday(resolvedTodayStr);

  const [weekStart, setWeekStart] = useState<string>(currentWeekStart);
  const weekScope = `${selectedPocket ?? "all"}-${weekStart}`;

  const [daySelection, setDaySelection] = useState<{
    scope: string;
    date: string | null;
  }>({ scope: "", date: null });

  const selectedDate =
    daySelection.scope === weekScope ? daySelection.date : null;

  const weekEnd = shiftDateString(weekStart, 6);

  const handlePrevWeek = () => {
    setWeekStart((prev) => shiftDateString(prev, -7));
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const next = shiftDateString(prev, 7);
      return next > currentWeekStart ? currentWeekStart : next;
    });
  };

  const handleSelectDate = (dateStr: string | null) => {
    setDaySelection({ scope: weekScope, date: dateStr });
  };

  // Pocket-scoped transactions across all dates so cross-month weeks and prev-week trend stay accurate.
  const pocketTransactions = useMemo(() => {
    if (!selectedPocket || selectedPocket === "all") return transactions;
    return transactions.filter((tx) => tx.pocketId === selectedPocket);
  }, [transactions, selectedPocket]);

  const displayedTransactions = useMemo(() => {
    if (!showFilter) return pocketTransactions;
    if (selectedDate) {
      return pocketTransactions.filter(
        (tx) => tx.transactionDate === selectedDate,
      );
    }
    return pocketTransactions.filter(
      (tx) => tx.transactionDate >= weekStart && tx.transactionDate <= weekEnd,
    );
  }, [pocketTransactions, showFilter, selectedDate, weekStart, weekEnd]);

  const compactWeekRange = formatCompactWeekRange(weekStart);
  const selectedDayLabel = selectedDate
    ? formatShortWeekdayDate(selectedDate)
    : null;

  const resolvedHeaderTitle = selectedDayLabel
    ? `Transactions (${selectedDayLabel})`
    : headerTitle;

  const resolvedEmptyTitle =
    emptyTitle ??
    (selectedDayLabel
      ? `No Transactions on ${selectedDayLabel}`
      : showFilter
        ? weekStart === currentWeekStart
          ? "No Transactions This Week"
          : `No Transactions (${compactWeekRange})`
        : undefined);

  const resolvedEmptyMessage =
    emptyMessage ??
    (selectedDayLabel
      ? `No spending or income recorded for ${selectedDayLabel}.`
      : showFilter
        ? `No spending or income recorded for ${compactWeekRange}.`
        : undefined);

  const datePickerValue =
    selectedDate ??
    (weekStart === currentWeekStart ? resolvedTodayStr : weekStart);

  return (
    <section className="py-2 flex flex-col gap-3">
      {showFilter && (
        <>
          <PeriodNavigator
            label={formatWeekRangeLabel(weekStart, resolvedTodayStr)}
            prevLabel="Previous Week"
            nextLabel="Next Week"
            onPrev={handlePrevWeek}
            onNext={handleNextWeek}
            nextDisabled={weekStart >= currentWeekStart}
          >
            <input
              type="date"
              aria-label="Jump to week by date"
              value={datePickerValue}
              max={resolvedTodayStr}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker?.();
                } catch {
                  // Browsers without showPicker support open on focus or native tap.
                }
              }}
              onChange={(e) => {
                const value = e.target.value;
                if (!value || !parseDateString(value)) return;
                const clamped =
                  value > resolvedTodayStr ? resolvedTodayStr : value;
                setWeekStart(getWeekStartMonday(clamped));
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
            />
          </PeriodNavigator>

          <WeeklySpendingCard
            transactions={pocketTransactions}
            weekStart={weekStart}
            todayStr={resolvedTodayStr}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </>
      )}

      {showHeader && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <h2 className="font-medium text-lg text-charcoal tracking-tight truncate">
            {resolvedHeaderTitle}
          </h2>
          {showEntryLength && (
            <p className="text-subtext text-xs shrink-0">
              {displayedTransactions.length}{" "}
              {displayedTransactions.length === 1
                ? "transaction"
                : "transactions"}
            </p>
          )}
        </div>
      )}

      <TransactionList
        transactions={displayedTransactions}
        limit={limit}
        showSeeAll={showSeeAll}
        showHeader={false}
        emptyTitle={resolvedEmptyTitle}
        emptyMessage={resolvedEmptyMessage}
      />
    </section>
  );
}

export function HistoryContainerSkeleton({
  showFilter = false,
}: {
  showFilter?: boolean;
}) {
  return (
    <section className="py-2 flex flex-col gap-3">
      {showFilter && (
        <>
          <Skeleton className="h-13 w-full rounded-full bg-grey300/30" />
          <WeeklySpendingCardSkeleton />
        </>
      )}
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-5 w-36 rounded-md bg-grey300/30" />
        <Skeleton className="h-4 w-20 rounded-md bg-grey300/30" />
      </div>
      <TransactionListSkeleton />
    </section>
  );
}
