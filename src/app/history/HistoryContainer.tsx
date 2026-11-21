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
  MONTH_NAMES,
  formatShortDate,
  getDaysInMonth,
  getJakartaDateString,
  parseDateString,
} from "@/lib/date";
import {
  WeeklySpendingCard,
  WeeklySpendingCardSkeleton,
} from "./WeeklySpendingCard";

interface HistoryContainerProps {
  transactions: TransactionWithDetails[];
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

  // Inisialisasi tanggal aktif (prioritas dari transaksi terbaru, fallback ke tanggal hari ini)
  const [currentDate, setCurrentDate] = useState<{
    year: number;
    month: number;
  }>(() => {
    const scoped =
      selectedPocket && selectedPocket !== "all"
        ? transactions.filter((tx) => tx.pocketId === selectedPocket)
        : transactions;
    const latestTx = scoped[0] ?? transactions[0];
    const parsedLatest = latestTx?.transactionDate
      ? parseDateString(latestTx.transactionDate)
      : null;

    if (parsedLatest) {
      return { year: parsedLatest.year, month: parsedLatest.monthIndex };
    }

    const jakartaToday = parseDateString(getJakartaDateString());
    if (jakartaToday) {
      return { year: jakartaToday.year, month: jakartaToday.monthIndex };
    }

    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const selectedMonth = currentDate.month;
  const selectedYear = currentDate.year;
  const monthScope = `${selectedYear}-${selectedMonth}`;

  const [daySelection, setDaySelection] = useState<{
    scope: string;
    day: number | null;
  }>({ scope: "", day: null });

  const selectedDay =
    daySelection.scope === monthScope ? daySelection.day : null;

  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);

  // Opsi daftar tahun dinamis berdasarkan data transaksi dan tahun saat ini
  const availableYears = useMemo(() => {
    const currentYear =
      parseDateString(getJakartaDateString())?.year ?? new Date().getFullYear();
    const txYears = transactions
      .map((tx) => parseInt(tx.transactionDate.split("-")[0], 10))
      .filter((y) => !isNaN(y));

    const minYear = Math.min(currentYear - 3, ...txYears);
    const maxYear = Math.max(currentYear + 1, ...txYears);

    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [transactions]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 },
    );
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 },
    );
  };

  const handleYearChange = (newYear: number) => {
    setCurrentDate((prev) => ({ year: newYear, month: prev.month }));
  };

  const handlePrevDay = () => {
    setDaySelection({
      scope: monthScope,
      day:
        selectedDay === null
          ? daysInSelectedMonth
          : selectedDay <= 1
            ? null
            : selectedDay - 1,
    });
  };

  const handleNextDay = () => {
    setDaySelection({
      scope: monthScope,
      day:
        selectedDay === null
          ? 1
          : selectedDay >= daysInSelectedMonth
            ? null
            : selectedDay + 1,
    });
  };

  const handleDayChange = (value: string) => {
    if (value === "all") {
      setDaySelection({ scope: monthScope, day: null });
      return;
    }
    const parsed = Number(value);
    if (
      Number.isInteger(parsed) &&
      parsed >= 1 &&
      parsed <= daysInSelectedMonth
    ) {
      setDaySelection({ scope: monthScope, day: parsed });
    }
  };

  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
  const selectedDayString =
    showFilter && selectedDay !== null
      ? `${monthPrefix}-${String(selectedDay).padStart(2, "0")}`
      : null;

  // Filter transaksi berdasarkan bulan, tahun, dan pocket terpilih
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchDate = showFilter
        ? tx.transactionDate.startsWith(monthPrefix)
        : true;
      const matchPocket =
        selectedPocket && selectedPocket !== "all"
          ? tx.pocketId === selectedPocket
          : true;
      return matchDate && matchPocket;
    });
  }, [transactions, showFilter, monthPrefix, selectedPocket]);

  const dayFilteredTransactions = useMemo(() => {
    if (!selectedDayString) return filteredTransactions;
    return filteredTransactions.filter(
      (tx) => tx.transactionDate === selectedDayString,
    );
  }, [filteredTransactions, selectedDayString]);

  const shortMonth = MONTH_NAMES[selectedMonth].slice(0, 3);
  const daySelectorLabel =
    selectedDayString !== null ? formatShortDate(selectedDayString) : "All Days";

  const resolvedEmptyTitle =
    emptyTitle ??
    (selectedDayString
      ? `No Transactions on ${formatShortDate(selectedDayString)}`
      : undefined);
  const resolvedEmptyMessage =
    emptyMessage ??
    (selectedDayString
      ? `No spending or income recorded for ${formatShortDate(selectedDayString)}.`
      : undefined);

  return (
    <section className="py-2 flex flex-col gap-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg text-charcoal tracking-tight">
            {headerTitle}
          </h2>
          {showEntryLength && (
            <p className="text-subtext text-xs">
              {dayFilteredTransactions.length} transactions
            </p>
          )}
        </div>
      )}

      {showFilter && (
        <>
          <PeriodNavigator
            label={`${MONTH_NAMES[selectedMonth]} ${selectedYear}`}
            prevLabel="Previous Month"
            nextLabel="Next Month"
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          >
            <select
              aria-label="Select Year"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </PeriodNavigator>

          <WeeklySpendingCard
            transactions={filteredTransactions}
            year={selectedYear}
            monthIndex={selectedMonth}
            monthName={MONTH_NAMES[selectedMonth]}
            scopeKey={`${selectedPocket ?? "all"}-${selectedYear}-${selectedMonth}`}
          />

          <PeriodNavigator
            label={daySelectorLabel}
            prevLabel="Previous Day"
            nextLabel="Next Day"
            onPrev={handlePrevDay}
            onNext={handleNextDay}
          >
            <select
              aria-label="Select Day"
              value={selectedDay === null ? "all" : String(selectedDay)}
              onChange={(e) => handleDayChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
            >
              <option value="all">All Days</option>
              {Array.from(
                { length: daysInSelectedMonth },
                (_, idx) => idx + 1,
              ).map((day) => (
                <option key={day} value={String(day)}>
                  {day} {shortMonth} {selectedYear}
                </option>
              ))}
            </select>
          </PeriodNavigator>
        </>
      )}

      <TransactionList
        transactions={dayFilteredTransactions}
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
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md bg-grey300/30" />
            <Skeleton className="h-4 w-12 rounded-md bg-grey300/30" />
          </div>
          <Skeleton className="h-13 w-full rounded-full bg-grey300/30" />
          <WeeklySpendingCardSkeleton />
          <Skeleton className="h-13 w-full rounded-full bg-grey300/30" />
        </>
      )}
      <TransactionListSkeleton />
    </section>
  );
}
