"use client";

import Image from "next/image";
import Link from "next/link";
import { Dot } from "lucide-react";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { RunningText } from "@/components/ui/running-text";
import {
  defaultHistoryList,
  historyConfigMap,
} from "@/components/style-config";

import EmptyLogo from "../../public/assets/no-data.svg";

export interface TransactionListProps {
  transactions: TransactionWithDetails[];
  limit?: number;
  showSeeAll?: boolean;
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

export function TransactionList({
  transactions,
  limit = 5,
  showSeeAll = false,
  showHeader = true,
  headerTitle = "Transaction History",
  showEntryLength = false,
  emptyTitle,
  emptyMessage,
}: TransactionListProps) {
  const displayedTransactions =
    typeof limit === "number" && limit > 0
      ? transactions.slice(0, limit)
      : transactions;

  return (
    <section className="py-2 flex flex-col gap-3">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg text-charcoal tracking-tight">
            {headerTitle}
          </h2>

          {showSeeAll ? (
            <Link
              href="/history"
              className="text-sm font-medium text-subtext hover:text-teal-deep transition-colors min-h-11 inline-flex items-center px-1 cursor-pointer"
            >
              See All
            </Link>
          ) : showEntryLength ? (
            <p className="text-subtext text-xs">
              {transactions.length} transactions
            </p>
          ) : null}
        </div>
      )}

      <section className="flex flex-col gap-2 w-full">
        {displayedTransactions.length === 0 ? (
          <NoHistoryEntry title={emptyTitle} message={emptyMessage} />
        ) : (
          displayedTransactions.map((tx) => {
            const config =
              historyConfigMap[tx.categoryName.toLowerCase()] ??
              defaultHistoryList;
            const Icon = config.icon;
            const isIncome = tx.categoryType === "income";
            const formattedAmount = Number(tx.amount || 0).toLocaleString(
              "id-ID",
            );

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

                  <RunningText as="p" className="text-xs text-subtext">
                    {formatTransactionDate(tx.transactionDate)}
                  </RunningText>
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
          })
        )}
      </section>
    </section>
  );
}

export function TransactionListSkeleton() {
  return (
    <section className="py-2 flex flex-col gap-3">
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
