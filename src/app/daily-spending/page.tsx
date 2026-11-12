import { Suspense } from "react";
import { getUserTransactions } from "@/db/queries";
import DailySpendingContainer from "./DailySpendingContainer";
import SpendingChart, { SpendingChartSkeleton } from "./SpendingChart";
import {
	DailySpendingCardSkeleton,
	getJakartaDateString,
} from "./DailySpendingCard";
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
	const todayStr = getJakartaDateString();
	const todayTransactions = transactions.filter(
		(tx) => tx.transactionDate === todayStr,
	);

	return (
		<HistoryContainer
			transactions={todayTransactions}
			limit={0}
			showHeader={true}
			headerTitle="Today's Transactions"
			showEntryLength={true}
			emptyTitle="No Transactions Today"
			emptyMessage="No spending or income recorded for today yet."
		/>
	);
}

async function SpendingChartSection() {
	const transactions = await getUserTransactions();
	return <SpendingChart transactions={transactions} />;
}

export default function DailySpendingPage() {
	return (
		<main className="flex-1 flex flex-col gap-4 p-5">
			<Suspense fallback={<DailySpendingSkeleton />}>
				<DailySpendingSection />
			</Suspense>

			<Suspense fallback={<SpendingChartSkeleton />}>
				<SpendingChartSection />
			</Suspense>

			<Suspense fallback={<HistoryContainerSkeleton />}>
				<DailyTransactionsSection />
			</Suspense>
		</main>
	);
}
