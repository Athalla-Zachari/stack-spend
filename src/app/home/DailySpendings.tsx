import Link from "next/link";
import { ChevronRight, TrendingDown } from "lucide-react";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";

interface DailySpendingsProps {
	transactions: TransactionWithDetails[];
}

function getTodayJakartaString(): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());

	const year = parts.find((p) => p.type === "year")?.value;
	const month = parts.find((p) => p.type === "month")?.value;
	const day = parts.find((p) => p.type === "day")?.value;

	return `${year}-${month}-${day}`;
}

export function DailySpendings({ transactions }: DailySpendingsProps) {
	const todayStr = getTodayJakartaString();

	const todayExpenses = transactions.filter(
		(t) =>
			t.categoryType === "expense" &&
			!t.relatedPocketId &&
			t.transactionDate === todayStr,
	);

	const todayTotal = todayExpenses.reduce(
		(sum, t) => sum + Number(t.amount || 0),
		0,
	);

	return (
		<Link
			href="/daily-spending"
			className="group block w-full rounded-2xl bg-teal-mid p-4.5 border border-grey300/70 shadow-xs hover:shadow-md hover:border-teal/50 transition-all cursor-pointer"
		>
			<div className="flex justify-between items-center mb-1.5">
				<div className="flex flex-col gap-2">
					<div className="text-grey300">
						Spent today
					</div>
                    <p className="text-3xl font-extrabold text-grey100 tracking-tight">
                        IDR {todayTotal.toLocaleString("id-ID")}
                    </p>
					<span className="bg-lime px-3 py-1 rounded-full text-sm text-subtext font-medium">
						2.3% less than yesterday
					</span>
				</div>
			</div>
		</Link>
	);
}

export function DailySpendingsSkeleton() {
	return (
		<div className="w-full rounded-2xl bg-white p-4.5 border border-grey300/70 shadow-xs flex flex-col gap-2">
			<div className="flex justify-between items-center">
				<Skeleton className="h-5 w-40 rounded-md" />
				<Skeleton className="h-4 w-20 rounded-md" />
			</div>
			<div className="flex justify-between items-baseline pt-1">
				<Skeleton className="h-7 w-32 rounded-lg" />
				<Skeleton className="h-4 w-16 rounded-md" />
			</div>
		</div>
	);
}