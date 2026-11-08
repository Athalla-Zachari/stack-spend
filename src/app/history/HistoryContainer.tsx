"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RunningText } from "@/components/ui/running-text";
import { historyConfigMap, defaultHistoryList } from "@/components/style-config";

import EmptyLogo from "../../../public/assets/no-data.svg";
import { Dot } from "lucide-react";

interface HistoryContainerProps {
  transactions: TransactionWithDetails[];
  limit?: number;
  showSeeAll?: boolean;
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
  showSeeAll = true,
}: HistoryContainerProps) {
  const router = useRouter();
  const displayedTransactions =
    typeof limit === "number" && limit > 0
      ? transactions.slice(0, limit)
      : transactions;

    return (
        <section className="py-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <h1 className="font-medium text-lg text-charcoal tracking-tight">
            Transaction History
            </h1>
            {showSeeAll && transactions.length > 0 && (
            <Button
                onClick={() => router.push("/history")}
                variant={"icon"}
                size={"xxs"}
                className={"text-subtext cursor-pointer"}
            >
                See All
            </Button>
            )}
        </div>

        <section className="flex flex-col gap-2 w-full">
            {transactions.length === 0 ? (
            <NoHistoryEntry />
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
                className="w-full rounded-xl shadow-lg p-3 flex items-center gap-3 bg-white"
                >
                    <span className={`shrink-0 flex items-center justify-center rounded-xl p-2 ${config.bgColor} ${config.iconColor}`}>
                    <Icon className="size-7!" />
                    </span>

                    <div className="flex-1 min-w-0 flex flex-col gap-px">
                    <RunningText as="h3" className="font-semibold text-lg/tight text-teal-deep">
                        {tx.note || tx.categoryName}
                    </RunningText>

                    <div className="flex items-center min-w-0 text-xs/tight text-charcoal font-medium">
                        <span className="shrink-0 uppercase">{tx.pocketName}</span>
                        <Dot aria-hidden="true" className="size-3.5 shrink-0 -mx-0.5 text-grey500"/>
                        <RunningText as="span" className="flex-1 min-w-0 capitalize leading-tight">
                            {tx.categoryName}
                        </RunningText>
                    </div>

                    <RunningText as="p" className="text-xs/tight text-grey500">
                        {formatTransactionDate(tx.transactionDate)}
                    </RunningText>
                    </div>

                    <span
                    className={`shrink-0 whitespace-nowrap text-right text-[17px] font-bold ${
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

export function HistoryContainerSkeleton() {
    return (
        <section className="py-2 bg-white flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex flex-col gap-2 w-full">
            {[1, 2, 3, 4, 5].map((item) => (
            <div
                key={item}
                className="w-full rounded-xl shadow-lg p-3 flex items-center gap-3 bg-white"
            >
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                <Skeleton className="h-3.5 w-32" />
                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-24 shrink-0" />
            </div>
            ))}
        </div>
        </section>
    );
}

export function NoHistoryEntry() {
    return (
        <section className="flex flex-col items-center gap-2 p-5 py-10">
        <Image
            src={EmptyLogo}
            alt="empty-state"
            className="h-34 w-auto object-contain"
        />
        <h1 className="font-semibold text-lg text-charcoal">
            No Transactions Yet
        </h1>
        </section>
    );
}
