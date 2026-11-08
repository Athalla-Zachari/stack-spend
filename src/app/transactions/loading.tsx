import { TransactionContainerSkeleton } from "./TransactionContainer";

export default function TransactionsLoading() {
  return (
    <main className="flex-1 flex flex-col justify-end">
      <TransactionContainerSkeleton />
    </main>
  );
}
