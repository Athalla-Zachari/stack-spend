import { Suspense } from "react";
import { getUserDebts } from "@/db/queries";
import DebtsContainer, { DebtsContainerSkeleton } from "./DebtsContainer";

async function DebtsSection() {
	const userDebts = await getUserDebts();

	return <DebtsContainer debts={userDebts} />;
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
