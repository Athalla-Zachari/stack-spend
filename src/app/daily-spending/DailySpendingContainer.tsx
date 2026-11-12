import type { TransactionWithDetails } from "@/db/queries";
import { DailySpendingCard } from "./DailySpendingCard";

interface DailySpendingContainerProps {
	transactions: TransactionWithDetails[];
}

export default function DailySpendingContainer({
	transactions,
}: DailySpendingContainerProps) {
	return (
		<section className="w-full flex flex-col gap-3">
			<DailySpendingCard transactions={transactions} />
		</section>
	);
}
