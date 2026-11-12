import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";
import {
  defaultHistoryList,
  historyConfigMap,
} from "@/components/style-config";

export interface DailySpendingCardProps {
  transactions: TransactionWithDetails[];
  showCategoryBreakdown?: boolean;
  className?: string;
}

interface CategorySpendingItem {
  name: string;
  amount: number;
  percentage: number;
  bgColor: string;
}

function getJakartaDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function getSpendingTrend(todayTotal: number, yesterdayTotal: number) {
  if (yesterdayTotal === 0 && todayTotal === 0) {
    return {
      text: "0% vs yesterday",
      icon: Minus,
    };
  }

  if (yesterdayTotal === 0) {
    return {
      text: "100% more than yesterday",
      icon: TrendingUp,
    };
  }

  if (todayTotal === 0) {
    return {
      text: "100% less than yesterday",
      icon: TrendingDown,
    };
  }

  const diff = Math.abs(todayTotal - yesterdayTotal);
  const percent = (diff / yesterdayTotal) * 100;
  const formatted = percent.toFixed(1).replace(/\.0$/, "");

  if (todayTotal > yesterdayTotal) {
    return {
      text: `${formatted}% more than yesterday`,
      icon: TrendingUp,
    };
  }

  if (todayTotal < yesterdayTotal) {
    return {
      text: `${formatted}% less than yesterday`,
      icon: TrendingDown,
    };
  }

  return {
    text: "0% vs yesterday",
    icon: Minus,
  };
}

function getCategoryBreakdown(
  todayExpenses: TransactionWithDetails[],
  todayTotal: number,
): CategorySpendingItem[] {
  if (todayTotal <= 0 || todayExpenses.length === 0) {
    return [];
  }

  const grouped = todayExpenses.reduce<Record<string, number>>((acc, t) => {
    const cat = (t.categoryName || "other").toLowerCase();
    acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([name, amount]) => {
      const config = historyConfigMap[name] ?? defaultHistoryList;
      const percentage = Math.round((amount / todayTotal) * 100);
      return {
        name,
        amount,
        percentage,
        bgColor: config.bgColor,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function DailySpendingCard({
  transactions,
  showCategoryBreakdown = true,
  className = "",
}: DailySpendingCardProps) {
	const todayStr = getJakartaDateString();
	const yesterdayStr = getJakartaDateString(new Date(Date.now() - 86_400_000));

	const todayExpenses = transactions.filter(
		(t) =>
		t.categoryType === "expense" &&
		!t.relatedPocketId &&
		t.transactionDate === todayStr,
	);

	const yesterdayExpenses = transactions.filter(
		(t) =>
		t.categoryType === "expense" &&
		!t.relatedPocketId &&
		t.transactionDate === yesterdayStr,
	);

	const todayTotal = todayExpenses.reduce(
		(sum, t) => sum + Number(t.amount || 0),
		0,
	);

	const yesterdayTotal = yesterdayExpenses.reduce(
		(sum, t) => sum + Number(t.amount || 0),
		0,
	);

	const { text: comparisonText, icon: TrendIcon } = getSpendingTrend(
		todayTotal,
		yesterdayTotal,
	);

	return (
		<section
		className={`w-full rounded-2xl bg-teal-mid p-4.5 border border-grey300/20 shadow-xs ${className}`}
		>
		<div className="flex justify-between items-start gap-3 sm:gap-4">
			<div className="flex flex-col gap-2 min-w-0 flex-1">
			<span className="text-grey300 text-xs sm:text-sm font-medium">
				Spent today
			</span>
			<p className="text-3xl sm:text-2xl lg:text-3xl font-extrabold text-grey100 tracking-tight truncate">
				IDR {todayTotal.toLocaleString("id-ID")}
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
  showCategoryBreakdown = true,
  className = "",
}: {
  showCategoryBreakdown?: boolean;
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
      {showCategoryBreakdown && (
        <div className="flex flex-col gap-2 shrink-0 items-end w-32 sm:w-40">
          <Skeleton className="h-4 w-16 rounded-md bg-grey300/30" />
          <Skeleton className="h-2 w-full rounded-full bg-grey300/30" />
          <Skeleton className="h-3 w-full rounded-md bg-grey300/30" />
          <Skeleton className="h-3 w-4/5 rounded-md bg-grey300/30" />
        </div>
      )}
    </div>
  );
}
