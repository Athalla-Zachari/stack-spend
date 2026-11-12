import { Suspense } from "react";
import { getUserTransactions } from "@/db/queries";
import DailySpendingContainer from "./DailySpendingContainer";
import { Skeleton } from "@/components/ui/skeleton";

function DailySpendingSkeleton() {
	return (
		<section className="w-full flex-1 flex flex-col gap-4 px-5 py-6 bg-mist rounded-tl-4xl rounded-tr-4xl min-h-[85vh]">
			<div className="w-full rounded-2xl bg-teal-mid/30 p-4.5 border border-grey300/70 shadow-xs flex flex-col gap-2">
				<Skeleton className="h-4 w-24 rounded-md bg-grey300/40" />
				<Skeleton className="h-8 w-44 rounded-lg bg-grey300/40" />
				<Skeleton className="h-6 w-36 rounded-full bg-grey300/40" />
			</div>
		</section>
	);
}

async function DailySpendingSection() {
	const transactions = await getUserTransactions();
	return <DailySpendingContainer transactions={transactions} />;
}

export default function DailySpendingPage() {
	return (
		<main className="flex-1 flex flex-col justify-end">
			<Suspense fallback={<DailySpendingSkeleton />}>
				<DailySpendingSection />
			</Suspense>
		</main>
	);
}
