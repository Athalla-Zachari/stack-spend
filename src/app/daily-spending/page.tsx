import { Suspense } from "react";
import { getUserTransactions } from "@/db/queries";
import DailySpendingContainer from "./DailySpendingContainer";
import { DailySpendingCardSkeleton } from "./DailySpendingCard";

function DailySpendingSkeleton() {
	return (
		<section className="w-full flex-1 flex flex-col gap-4 px-5 py-6 bg-mist rounded-tl-4xl rounded-tr-4xl min-h-[85vh]">
			<DailySpendingCardSkeleton />
		</section>
	);
}

async function DailySpendingSection() {
	const transactions = await getUserTransactions();
	return <DailySpendingContainer transactions={transactions} />;
}

async function HistorySection(){
	const transactions = await getUserTransactions();

	return(
		<>
		</>
	)
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
