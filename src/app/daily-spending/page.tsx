import { Suspense } from "react";
import { getUserTransactions } from "@/db/queries";
import { getJakartaDateString } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { DailySpendingCardSkeleton } from "@/components/DailySpendingCard";
import { TransactionListSkeleton } from "@/components/TransactionList";
import DailySpendingContainer from "./DailySpendingContainer";
import { SpendingChartSkeleton } from "./SpendingChart";

function DailySpendingPageSkeleton() {
  return (
    <div className="w-full flex flex-col gap-4">
      <Skeleton className="h-13 w-full rounded-full bg-grey300/30" />
      <DailySpendingCardSkeleton />
      <SpendingChartSkeleton />
      <TransactionListSkeleton />
    </div>
  );
}

async function DailySpendingSection() {
  const transactions = await getUserTransactions();
  const initialDate = getJakartaDateString();

  return (
    <DailySpendingContainer
      transactions={transactions}
      initialDate={initialDate}
    />
  );
}

export default function DailySpendingPage() {
  return (
    <main className="flex-1 flex flex-col gap-4 p-5">
      <Suspense fallback={<DailySpendingPageSkeleton />}>
        <DailySpendingSection />
      </Suspense>
    </main>
  );
}
