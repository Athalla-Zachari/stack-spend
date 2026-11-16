import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatShortDate,
  getJakartaDateString,
  shiftDateString,
} from "@/lib/date";

export { getJakartaDateString };

export interface DailySpendingCardProps {
  transactions: TransactionWithDetails[];
  selectedDate?: string;
  todayStr?: string;
  className?: string;
}

function getSpendingTrend(
  currentTotal: number,
  previousTotal: number,
  targetLabel: string,
) {
  if (previousTotal === 0 && currentTotal === 0) {
    return {
      text: `0% vs ${targetLabel}`,
      icon: Minus,
    };
  }

  if (previousTotal === 0) {
    return {
      text: `100% more than ${targetLabel}`,
      icon: TrendingUp,
    };
  }

  if (currentTotal === 0) {
    return {
      text: `100% less than ${targetLabel}`,
      icon: TrendingDown,
    };
  }

  const diff = Math.abs(currentTotal - previousTotal);
  const percent = (diff / previousTotal) * 100;
  const formatted = percent.toFixed(1).replace(/\.0$/, "");

  if (currentTotal > previousTotal) {
    return {
      text: `${formatted}% more than ${targetLabel}`,
      icon: TrendingUp,
    };
  }

  if (currentTotal < previousTotal) {
    return {
      text: `${formatted}% less than ${targetLabel}`,
      icon: TrendingDown,
    };
  }

  return {
    text: `0% vs ${targetLabel}`,
    icon: Minus,
  };
}

export function DailySpendingCard({
  transactions,
  selectedDate,
  todayStr,
  className = "",
}: DailySpendingCardProps) {
  const currentTodayStr = todayStr ?? getJakartaDateString();
  const activeDateStr = selectedDate ?? currentTodayStr;
  const prevDateStr = shiftDateString(activeDateStr, -1);
  const isToday = activeDateStr === currentTodayStr;

  const dayExpenses = transactions.filter(
    (t) =>
      t.categoryType === "expense" &&
      !t.relatedPocketId &&
      t.transactionDate === activeDateStr,
  );

  const prevExpenses = transactions.filter(
    (t) =>
      t.categoryType === "expense" &&
      !t.relatedPocketId &&
      t.transactionDate === prevDateStr,
  );

  const dayTotal = dayExpenses.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0,
  );

  const prevTotal = prevExpenses.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0,
  );

  const { text: comparisonText, icon: TrendIcon } = getSpendingTrend(
    dayTotal,
    prevTotal,
    isToday ? "yesterday" : "prev day",
  );

  return (
    <section
      className={`w-full rounded-2xl bg-teal-mid p-4.5 border border-grey300/20 shadow-xs ${className}`}
    >
      <div className="flex justify-between items-start gap-3 sm:gap-4">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <span className="text-grey300 text-xs sm:text-sm font-medium">
            {isToday ? "Spent today" : `Spent on ${formatShortDate(activeDateStr)}`}
          </span>
          <p className="text-3xl sm:text-2xl lg:text-3xl font-extrabold text-grey100 tracking-tight truncate">
            IDR {dayTotal.toLocaleString("id-ID")}
          </p>
          <span className="bg-lime px-2.5 py-1 rounded-full text-xs text-teal-deep font-semibold inline-flex items-center gap-1.5 w-fit">
            <TrendIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{comparisonText}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

export function DailySpendingCardSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`w-full rounded-2xl bg-teal-mid/30 p-4.5 border border-grey300/20 shadow-xs flex items-start justify-between gap-3 sm:gap-4 ${className}`}
    >
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <Skeleton className="h-4 w-20 rounded-md bg-grey300/30" />
        <Skeleton className="h-8 w-36 sm:w-44 rounded-lg bg-grey300/30" />
        <Skeleton className="h-6 w-32 rounded-full bg-grey300/30" />
      </div>
    </div>
  );
}
