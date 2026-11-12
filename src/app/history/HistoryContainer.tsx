"use client";

import { useState, useMemo } from "react";
import Image from "next/image"; 
import { useRouter, useSearchParams } from "next/navigation";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RunningText } from "@/components/ui/running-text";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { historyConfigMap, defaultHistoryList } from "@/components/style-config";

import EmptyLogo from "../../../public/assets/no-data.svg";
import { Dot } from "lucide-react";

interface HistoryContainerProps {
  transactions: TransactionWithDetails[];
  limit?: number;
  showSeeAll?: boolean;
  showFilter?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  showEntryLength?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
}: HistoryContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPocket = searchParams.get("pocket");

  // Inisialisasi tanggal aktif (prioritas dari transaksi terbaru, fallback ke tanggal hari ini)
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (transactions.length > 0 && transactions[0].transactionDate) {
      const parts = transactions[0].transactionDate.split("-");
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
          return new Date(y, m, 1);
        }
      }
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const selectedMonth = currentDate.getMonth();
  const selectedYear = currentDate.getFullYear();

  // Opsi daftar tahun dinamis berdasarkan data transaksi dan tahun saat ini
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
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
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleYearChange = (newYear: number) => {
    setCurrentDate((prev) => new Date(newYear, prev.getMonth(), 1));
  };

  // Filter transaksi berdasarkan bulan, tahun, dan pocket terpilih
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchDate = showFilter
        ? tx.transactionDate.startsWith(
            `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`
          )
        : true;
      const matchPocket =
        selectedPocket && selectedPocket !== "all"
          ? tx.pocketId === selectedPocket
          : true;
      return matchDate && matchPocket;
    });
  }, [transactions, showFilter, selectedYear, selectedMonth, selectedPocket]);

  const displayedTransactions =
    typeof limit === "number" && limit > 0
      ? filteredTransactions.slice(0, limit)
      : filteredTransactions;

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
            <RunningText as="p" className="text-xs text-grey500">
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
              variant={"icon"}
              size={"xxs"}
              className={"text-subtext cursor-pointer"}
            >
              See All
            </Button>
          ) : showEntryLength ? (
            <p className="text-subtext text-xs">
              {filteredTransactions.length} transactions
            </p>
          ) : null}
        </div>
      )}

      {showFilter && transactions.length > 0 && (
        <div className="flex justify-between items-center border border-charcoal text-charcoal font-semibold rounded-full px-2 py-1">
          <Button
            type="button"
            variant={"icon"}
            size={"icon"}
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className="cursor-pointer hover:bg-grey100 rounded-full"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <div className="relative flex items-center justify-center">
            <Button
              type="button"
              variant={"icon"}
              className="flex items-center gap-1 w-fit text-[16px] text-charcoal font-semibold cursor-pointer px-3 py-1"
            >
              <span>
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>
              <ChevronDown className="size-4 shrink-0" />
            </Button>
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
          </div>

          <Button
            type="button"
            variant={"icon"}
            size={"icon"}
            onClick={handleNextMonth}
            aria-label="Next Month"
            className="cursor-pointer hover:bg-grey100 rounded-full"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}

      <section className="flex flex-col gap-2 w-full">
        {displayedTransactions.length === 0 ? (
          <NoHistoryEntry />
        ) : (
          displayedTransactions.map((tx) =>
            renderTransactionCard(tx, true),
          )
        )}
      </section>
    </section>
  );
}

export function HistoryContainerSkeleton() {
  return (
    <section className="py-2 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-md bg-grey300/30" />
        <Skeleton className="h-4 w-12 rounded-md bg-grey300/30" />
      </div>
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

export function NoHistoryEntry() {
  return (
    <section className="flex-1 flex flex-col items-center gap-2 p-5 py-14">
      <Image
        src={EmptyLogo}
        alt="empty-state"
        className="h-32 w-auto object-contain"
      />
      <h3 className="font-semibold text-base sm:text-lg text-charcoal">
        No Transactions Yet
      </h3>
      <p className="text-xs sm:text-sm text-subtext text-center max-w-xs">
        Your transactions will appear here once you record your first spending.
      </p>
    </section>
  );
}
