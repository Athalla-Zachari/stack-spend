"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Dot } from "lucide-react";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RunningText } from "@/components/ui/running-text";
import { PeriodNavigator } from "@/components/ui/period-navigator";
import { historyConfigMap, defaultHistoryList } from "@/components/style-config";
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

import EmptyLogo from "../../../public/assets/no-data.svg";

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

function formatTransactionDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
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
  const router = useRouter();
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

  const displayedTransactions =
    typeof limit === "number" && limit > 0
      ? dayFilteredTransactions.slice(0, limit)
      : dayFilteredTransactions;

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

  const renderTransactionCard = (
    tx: TransactionWithDetails,
    showDate: boolean,
  ) => {
    const config =
      historyConfigMap[tx.categoryName.toLowerCase()] ?? defaultHistoryList;
    const Icon = config.icon;
    const isIncome = tx.categoryType === "income";
    const formattedAmount = Number(tx.amount || 0).toLocaleString("id-ID");

    return (
      <div
        key={tx.id}
        className="w-full rounded-xl border border-grey300/40 p-3 flex items-center gap-3 bg-white shadow-xs hover:border-grey300 transition-colors"
      >
        <span
          className={`shrink-0 flex items-center justify-center rounded-xl p-2 ${config.bgColor} ${config.iconColor}`}
        >
          <Icon className="size-6 sm:size-7" aria-hidden="true" />
        </span>

        <div className="flex-1 min-w-0 flex flex-col gap-px">
          <RunningText
            as="h4"
            className="font-semibold text-base sm:text-lg text-teal-deep leading-tight"
          >
            {tx.note || tx.categoryName}
          </RunningText>

          <div className="flex items-center min-w-0 text-xs text-charcoal font-medium">
            <span className="shrink-0 uppercase">{tx.pocketName}</span>
            <Dot
              aria-hidden="true"
              className="size-3.5 shrink-0 -mx-0.5 text-grey500"
            />
            <RunningText
              as="span"
              className="flex-1 min-w-0 capitalize leading-tight"
            >
              {tx.categoryName}
            </RunningText>
          </div>

          {showDate && (
            <RunningText as="p" className="text-xs text-subtext">
              {formatTransactionDate(tx.transactionDate)}
            </RunningText>
          )}
        </div>

        <span
          className={`shrink-0 whitespace-nowrap text-right text-base sm:text-[17px] font-bold ${
            isIncome ? "text-green" : "text-error"
          }`}
        >
          {isIncome ? "+" : "-"}IDR {formattedAmount}
        </span>
      </div>
    );
  };

  return (
    <section className="py-2 flex flex-col gap-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg text-charcoal tracking-tight">
            {headerTitle}
          </h2>

          {showSeeAll ? (
            <Button
              onClick={() => router.push("/history")}
              variant="icon"
              size="xxs"
              className="text-subtext cursor-pointer"
            >
              See All
            </Button>
          ) : showEntryLength ? (
            <p className="text-subtext text-xs">
              {dayFilteredTransactions.length} transactions
            </p>
          ) : null}
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

      <section className="flex flex-col gap-2 w-full">
        {displayedTransactions.length === 0 ? (
          <NoHistoryEntry
            title={resolvedEmptyTitle}
            message={resolvedEmptyMessage}
          />
        ) : (
          displayedTransactions.map((tx) => renderTransactionCard(tx, true))
        )}
      </section>
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
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-md bg-grey300/30" />
        <Skeleton className="h-4 w-12 rounded-md bg-grey300/30" />
      </div>
      {showFilter && (
        <>
          <Skeleton className="h-13 w-full rounded-full bg-grey300/30" />
          <WeeklySpendingCardSkeleton />
          <Skeleton className="h-13 w-full rounded-full bg-grey300/30" />
        </>
      )}
      <div className="flex flex-col gap-2 w-full">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="w-full rounded-xl border border-grey300/40 p-3 flex items-center gap-3 bg-white shadow-xs"
          >
            <Skeleton className="size-11 shrink-0 rounded-xl bg-grey300/30" />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <Skeleton className="h-3.5 w-32 rounded-md bg-grey300/30" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3 w-10 rounded-md bg-grey300/30" />
                <Skeleton className="h-3 w-16 rounded-md bg-grey300/30" />
              </div>
            </div>
            <Skeleton className="h-5 w-24 shrink-0 rounded-md bg-grey300/30" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function NoHistoryEntry({
  title = "No Transactions Yet",
  message = "Your transactions will appear here once you record your first spending.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <section className="flex-1 flex flex-col items-center gap-2 p-5 py-14">
      <Image
        src={EmptyLogo}
        alt="empty-state"
        className="h-32 w-auto object-contain"
      />
      <h3 className="font-semibold text-base sm:text-lg text-charcoal">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-subtext text-center max-w-xs">
        {message}
      </p>
    </section>
  );
}
