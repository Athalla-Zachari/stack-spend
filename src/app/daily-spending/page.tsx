import { Suspense } from "react";
import { getUserTransactions } from "@/db/queries";
import DailySpendingContainer from "./DailySpendingContainer";
import { DailySpendingCardSkeleton } from "./DailySpendingCard";
import HistoryContainer, {
	HistoryContainerSkeleton,
} from "../history/HistoryContainer";

function DailySpendingSkeleton() {
	return <DailySpendingCardSkeleton />;
}

async function DailySpendingSection() {
	const transactions = await getUserTransactions();
	return <DailySpendingContainer transactions={transactions} />;
}

async function DailyTransactionsSection() {
	const transactions = await getUserTransactions();

	return (
		<HistoryContainer
			transactions={transactions}
			limit={0}
			showHeader={true}
			headerTitle="Daily Transactions"
			showEntryLength={true}
		/>
	);
}

export default function DailySpendingPage() {
	return (
		<main className="flex-1 flex flex-col gap-4 p-5">
			<Suspense fallback={<DailySpendingSkeleton />}>
				<DailySpendingSection />
			</Suspense>

			<Suspense fallback={<HistoryContainerSkeleton />}>
				<DailyTransactionsSection />
			</Suspense>
		</main>
	);
}
