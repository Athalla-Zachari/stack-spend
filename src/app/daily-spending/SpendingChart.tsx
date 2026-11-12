import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor } from "@/components/style-config";
import { getJakartaDateString } from "./DailySpendingCard";

interface SpendingChartProps {
  transactions: TransactionWithDetails[];
}

interface CategorySlice {
  name: string;
  amount: number;
  widthPercent: number;
  displayPercent: number;
  colorClass: string;
}

export default function SpendingChart({ transactions }: SpendingChartProps) {
  const todayStr = getJakartaDateString();

  const todayExpenses = transactions.filter(
    (t) =>
      t.categoryType === "expense" &&
      !t.relatedPocketId &&
      t.transactionDate === todayStr,
  );

  const totalTodaySpending = todayExpenses.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0,
  );

  const categoryMap = todayExpenses.reduce<Record<string, number>>((acc, t) => {
    const cat = (t.categoryName || "other").trim().toLowerCase();
    acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
    return acc;
  }, {});

  const categoryEntries = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  const categories: CategorySlice[] = categoryEntries.map(
    ([name, amount], index) => {
      const rawPercent =
        totalTodaySpending > 0 ? (amount / totalTodaySpending) * 100 : 0;
      const colorClass = getCategoryColor(name, index);

      return {
        name,
        amount,
        widthPercent: rawPercent,
        displayPercent: Math.round(rawPercent),
        colorClass,
      };
    },
  );

  return (
    <section className="w-full flex flex-col gap-2.5">
      <h2 className="font-semibold text-base sm:text-lg text-teal-deep tracking-tight">
        By category
      </h2>

      {categories.length === 0 ? (
        <div className="flex flex-col gap-1.5">
          <div
            role="progressbar"
            aria-label="No spending recorded today"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
            className="w-full h-3 sm:h-3.5 rounded-full bg-grey300/40"
          />
          <p className="text-xs text-subtext">No spending recorded today</p>
        </div>
      ) : (
        <div>
          <div
            role="progressbar"
            aria-label="Spending breakdown by category"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={100}
            className="w-full h-3 sm:h-3.5 rounded-full overflow-hidden flex bg-grey300/40"
          >
            {categories.map((cat) => (
              <div
                key={cat.name}
                style={{ width: `${cat.widthPercent}%` }}
                className={`h-full ${cat.colorClass} transition-all duration-300`}
                title={`${cat.name}: IDR ${cat.amount.toLocaleString("id-ID")} (${cat.displayPercent}%)`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span
                  className={`size-2.5 sm:size-3 rounded-[3px] shrink-0 ${cat.colorClass}`}
                  aria-hidden="true"
                />
                <span className="text-xs sm:text-sm font-medium text-subtext capitalize">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function SpendingChartSkeleton() {
  return (
    <section className="w-full flex flex-col gap-2.5">
      <Skeleton className="h-5 w-28 rounded-md bg-grey300/30" />
      <Skeleton className="h-3 sm:h-3.5 w-full rounded-full bg-grey300/30" />
      <div className="flex items-center gap-4 mt-1">
        <Skeleton className="h-4 w-16 rounded bg-grey300/30" />
        <Skeleton className="h-4 w-20 rounded bg-grey300/30" />
        <Skeleton className="h-4 w-16 rounded bg-grey300/30" />
      </div>
    </section>
  );
}
