import { Suspense } from "react";
import { getUserPockets, getCategories } from "@/db/queries";
import TransferContainer, {
  TransferContainerSkeleton,
} from "./TransferContainer";

async function TransferSection() {
  const [userPockets, allCategories] = await Promise.all([
    getUserPockets(),
    getCategories(),
  ]);

  return (
    <TransferContainer pockets={userPockets} categories={allCategories} />
  );
}

export default function TransferPage() {
  return (
    <main className="flex-1 flex flex-col justify-end">
      <Suspense fallback={<TransferContainerSkeleton />}>
        <TransferSection />
      </Suspense>
    </main>
  );
}
