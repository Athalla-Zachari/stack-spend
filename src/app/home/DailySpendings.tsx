import Link from "next/link";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { TransactionWithDetails } from "@/db/queries";
import { Skeleton } from "@/components/ui/skeleton";

interface DailySpendingsProps {
	transactions: TransactionWithDetails[];
}

function getJakartaDateString(date: Date = new Date()): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);

	const year = parts.find((p) => p.type === "year")?.value;
	const month = parts.find((p) => p.type === "month")?.value;
	const day = parts.find((p) => p.type === "day")?.value;

	return `${year}-${month}-${day}`;
}

function getSpendingTrend(todayTotal: number, yesterdayTotal: number) {
	if (yesterdayTotal === 0 && todayTotal === 0) {
		return {
			text: "0% vs yesterday",
			icon: Minus,
		};
	}

	if (yesterdayTotal === 0) {
		return {
			text: "100% more than yesterday",
			icon: TrendingUp,
		};
	}

	if (todayTotal === 0) {
		return {
			text: "100% less than yesterday",
			icon: TrendingDown,
		};
	}

	const diff = Math.abs(todayTotal - yesterdayTotal);
	const percent = (diff / yesterdayTotal) * 100;
	const formatted = percent.toFixed(1).replace(/\.0$/, "");

	if (todayTotal > yesterdayTotal) {
		return {
			text: `${formatted}% more than yesterday`,
			icon: TrendingUp,
		};
	}

	if (todayTotal < yesterdayTotal) {
		return {
			text: `${formatted}% less than yesterday`,
			icon: TrendingDown,
		};
	}

	return {
		text: "0% vs yesterday",
		icon: Minus,
	};
}

export function DailySpendings({ transactions }: DailySpendingsProps) {
	const todayStr = getJakartaDateString();
	const yesterdayStr = getJakartaDateString(new Date(Date.now() - 86_400_000));

	const todayExpenses = transactions.filter(
		(t) =>
			t.categoryType === "expense" &&
			!t.relatedPocketId &&
			t.transactionDate === todayStr,
	);

	const yesterdayExpenses = transactions.filter(
		(t) =>
			t.categoryType === "expense" &&
			!t.relatedPocketId &&
			t.transactionDate === yesterdayStr,
	);

	const todayTotal = todayExpenses.reduce(
		(sum, t) => sum + Number(t.amount || 0),
		0,
	);

	const yesterdayTotal = yesterdayExpenses.reduce(
		(sum, t) => sum + Number(t.amount || 0),
		0,
	);

	const { text: comparisonText, icon: TrendIcon } = getSpendingTrend(
		todayTotal,
		yesterdayTotal,
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
					<span className="bg-lime px-3 py-1 rounded-full text-sm text-subtext font-medium inline-flex items-center gap-1.5 w-fit">
						<TrendIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
						<span>{comparisonText}</span>
					</span>
				</div>
			</div>
		</Link>
	);
}

export function DailySpendingsSkeleton() {
	return (
		<div className="w-full rounded-2xl bg-teal-mid/30 p-4.5 border border-grey300/70 shadow-xs flex flex-col gap-2">
			<Skeleton className="h-4 w-24 rounded-md bg-grey300/40" />
			<Skeleton className="h-8 w-44 rounded-lg bg-grey300/40" />
			<Skeleton className="h-6 w-36 rounded-full bg-grey300/40" />
		</div>
	);
}