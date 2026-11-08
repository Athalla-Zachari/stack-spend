import { Suspense } from "react";
import { getUserTransactions } from "@/db/queries";
import HistoryContainer, {
  HistoryContainerSkeleton,
} from "./HistoryContainer";

async function HistorySection() {
  const transactions = await getUserTransactions();

  return (
    <HistoryContainer
      transactions={transactions}
      limit={0}
      showSeeAll={false}
    />
  );
}


export default function HistoryPage() {
  return (
    <main className="flex-1 flex flex-col">
      <Suspense fallback={<HistoryContainerSkeleton />}>
        <HistorySection />
      </Suspense>
    </main>
  );
}
