import { CardContainerSkeleton } from "./CardContainer";
import { DailySpendingCardSkeleton } from "@/components/DailySpendingCard";
import { TransactionListSkeleton } from "@/components/TransactionList";

export default function HomeLoading() {
  return (
    <main className="w-full flex flex-col bg-none gap-4">
      <CardContainerSkeleton />
      <DailySpendingCardSkeleton />
      <TransactionListSkeleton />
    </main>
  );
}
