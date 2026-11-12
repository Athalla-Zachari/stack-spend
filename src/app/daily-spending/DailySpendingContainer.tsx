import type { TransactionWithDetails } from "@/db/queries";
import { DailySpendingCard } from "./DailySpendingCard";

interface DailySpendingContainerProps {
	transactions: TransactionWithDetails[];
}

export default function DailySpendingContainer({
	transactions,
}: DailySpendingContainerProps) {
	return (
		<section className="w-full flex-1 flex flex-col gap-4 p-5 bg-mist rounded-tl-4xl rounded-tr-4xl min-h-[85vh]">
			<DailySpendingCard transactions={transactions} />
		</section>
	);
}
