import { Suspense } from "react";
import { getUserDebts, getUserPockets } from "@/db/queries";
import DebtsContainer, { DebtsContainerSkeleton } from "./DebtsContainer";

async function DebtsSection() {
	const [userDebts, userPockets] = await Promise.all([
		getUserDebts(),
		getUserPockets(),
	]);

	return <DebtsContainer debts={userDebts} pockets={userPockets} />;
}

export default function DebtsPage() {
	return (
		<main className="flex-1 flex flex-col justify-end">
			<Suspense fallback={<DebtsContainerSkeleton />}>
				<DebtsSection />
			</Suspense>
		</main>
	);
}
