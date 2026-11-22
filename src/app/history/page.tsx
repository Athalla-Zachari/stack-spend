import { Suspense } from "react";
import { getUserTransactions } from "@/db/queries";
import { getJakartaDateString } from "@/lib/date";
import HistoryContainer, {
  HistoryContainerSkeleton,
} from "./HistoryContainer";

async function HistorySection() {
  const transactions = await getUserTransactions();
  const todayStr = getJakartaDateString();

  return (
    <HistoryContainer
      transactions={transactions}
      todayStr={todayStr}
      limit={0}
      showSeeAll={false}
      showFilter={true}
      showEntryLength={true}
    />
  );
}


export default function HistoryPage() {
  return (
    <main className="flex-1 flex flex-col">
      <Suspense fallback={<HistoryContainerSkeleton showFilter={true} />}>
        <HistorySection />
      </Suspense>
    </main>
  );
}
