import { Suspense } from "react";
import { getUserTransactions } from "@/db/queries";
import DailySpendingContainer from "./DailySpendingContainer";
import { Skeleton } from "@/components/ui/skeleton";

function DailySpendingSkeleton() {
	return (
		<section className="w-full flex-1 flex flex-col gap-4 px-5 py-6 bg-mist rounded-tl-4xl rounded-tr-4xl min-h-[85vh]">
			<Skeleton className="h-11 w-full rounded-2xl" />
			<Skeleton className="h-32 w-full rounded-3xl" />
			<div className="flex justify-between items-center pt-2">
				<Skeleton className="h-5 w-36 rounded-md" />
				<Skeleton className="h-4 w-20 rounded-md" />
			</div>
			<div className="flex flex-col gap-2.5">
				<Skeleton className="h-16 w-full rounded-2xl" />
				<Skeleton className="h-16 w-full rounded-2xl" />
				<Skeleton className="h-16 w-full rounded-2xl" />
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
