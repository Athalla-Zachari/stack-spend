import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { getUserPockets, getUserTransactions } from "@/db/queries";

import CardContainer, { CardContainerSkeleton } from "./CardContainer";
import { DailySpendings, DailySpendingsSkeleton } from "./DailySpendings";
import HistoryContainer, { HistoryContainerSkeleton } from "@/app/history/HistoryContainer";

async function PocketsSection() {
	const [session, userPockets] = await Promise.all([
		requireSession(),
		getUserPockets(),
	]);

	return <CardContainer pockets={userPockets} userName={session.displayName} />;
}

async function DailySpendingSection() {
	const transactions = await getUserTransactions();
	return <DailySpendings transactions={transactions} />;
}

async function HistorySection() {
	const transactions = await getUserTransactions();

	return <HistoryContainer transactions={transactions} showSeeAll={true} />;
}

export default function HomePage() {
	return (
		<main className="w-full flex flex-col bg-none gap-4">
			<Suspense fallback={<CardContainerSkeleton />}>
				<PocketsSection />
			</Suspense>

			<Suspense fallback={<DailySpendingsSkeleton />}>
				<DailySpendingSection />
			</Suspense>

			<Suspense fallback={<HistoryContainerSkeleton />}>
				<HistorySection />
			</Suspense>
		</main>
	);
}
