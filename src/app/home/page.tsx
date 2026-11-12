import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { getUserPockets, getUserTransactions } from "@/db/queries";
import Link from "next/link";

import CardContainer, { CardContainerSkeleton } from "./CardContainer";
import {
	DailySpendingCard,
	DailySpendingCardSkeleton,
} from "@/app/daily-spending/DailySpendingCard";
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

	return (
		<Link href="/daily-spending">
			<DailySpendingCard transactions={transactions} />
		</Link>
	);
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

			<Suspense fallback={<DailySpendingCardSkeleton />}>
				<DailySpendingSection />
			</Suspense>

			<Suspense fallback={<HistoryContainerSkeleton />}>
				<HistorySection />
			</Suspense>
		</main>
	);
}
