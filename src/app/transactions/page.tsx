import { Suspense } from "react";
import { getUserPockets, getCategories } from "@/db/queries";
import TransactionContainer, {
  TransactionContainerSkeleton,
} from "./TransactionContainer";

async function TransactionSection() {
  const [userPockets, allCategories] = await Promise.all([
    getUserPockets(),
    getCategories(),
  ]);

  return (
    <TransactionContainer pockets={userPockets} categories={allCategories} />
  );
}

export default function TransactionsPage() {
  return (
    <main className="flex-1 flex flex-col justify-end">
      <Suspense fallback={<TransactionContainerSkeleton />}>
        <TransactionSection />
      </Suspense>
    </main>
  );
}
