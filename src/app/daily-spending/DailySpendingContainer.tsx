"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CirclePlus, Calendar, Receipt, TrendingDown, ArrowUpRight } from "lucide-react";
import type { TransactionWithDetails } from "@/db/queries";
import { Button } from "@/components/ui/button";

interface DailySpendingContainerProps {
	transactions: TransactionWithDetails[];
}

type Period = "today" | "week" | "month";

function getJakartaDate(): Date {
	const now = new Date();
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const parts = formatter.formatToParts(now);
	const year = Number(parts.find((p) => p.type === "year")?.value);
	const month = Number(parts.find((p) => p.type === "month")?.value) - 1;
	const day = Number(parts.find((p) => p.type === "day")?.value);
	return new Date(year, month, day);
}

function formatDateString(d: Date): string {
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
	const parts = dateStr.split("-");
	if (parts.length === 3) {
		return `${parts[2]}/${parts[1]}/${parts[0]}`;
	}
	return dateStr;
}

export default function DailySpendingContainer({
	transactions,
}: DailySpendingContainerProps) {
	const [activePeriod, setActivePeriod] = useState<Period>("today");

	// Filter expenses only
	const expenseTransactions = useMemo(() => {
		return transactions.filter(
			(t) => t.categoryType === "expense" && !t.relatedPocketId,
		);
	}, [transactions]);

	const { todayStr, startOfWeekStr, startOfMonthStr, daysInWeekElapsed, daysInMonthElapsed } = useMemo(() => {
		const now = getJakartaDate();
		const todayStr = formatDateString(now);

		// Start of week: Monday
		const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
		const diffToMonday = (currentDay + 6) % 7;
		const monday = new Date(now);
		monday.setDate(now.getDate() - diffToMonday);
		const startOfWeekStr = formatDateString(monday);
		const daysInWeekElapsed = diffToMonday + 1;

		// Start of month
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfMonthStr = formatDateString(startOfMonth);
		const daysInMonthElapsed = now.getDate();

		return {
			todayStr,
			startOfWeekStr,
			startOfMonthStr,
			daysInWeekElapsed,
			daysInMonthElapsed,
		};
	}, []);

	// Filter by active period
	const filteredTransactions = useMemo(() => {
		return expenseTransactions.filter((t) => {
			if (activePeriod === "today") {
				return t.transactionDate === todayStr;
			}
			if (activePeriod === "week") {
				return (
					t.transactionDate >= startOfWeekStr &&
					t.transactionDate <= todayStr
				);
			}
			if (activePeriod === "month") {
				return (
					t.transactionDate >= startOfMonthStr &&
					t.transactionDate <= todayStr
				);
			}
			return true;
		});
	}, [expenseTransactions, activePeriod, todayStr, startOfWeekStr, startOfMonthStr]);

	const totalExpense = useMemo(() => {
		return filteredTransactions.reduce(
			(sum, t) => sum + Number(t.amount || 0),
			0,
		);
	}, [filteredTransactions]);

	const avgDaily = useMemo(() => {
		if (activePeriod === "week") {
			return Math.round(totalExpense / Math.max(1, daysInWeekElapsed));
		}
		if (activePeriod === "month") {
			return Math.round(totalExpense / Math.max(1, daysInMonthElapsed));
		}
		return totalExpense;
	}, [totalExpense, activePeriod, daysInWeekElapsed, daysInMonthElapsed]);

	return (
		<section className="w-full flex-1 flex flex-col gap-4 px-5 py-6 bg-mist rounded-tl-4xl rounded-tr-4xl min-h-[85vh]">
			{/* Period Pill Selector */}
			<div className="flex items-center gap-2 p-1 bg-white/80 rounded-2xl border border-grey300/80 shadow-xs">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setActivePeriod("today")}
					aria-pressed={activePeriod === "today"}
					className={`flex-1 min-h-[44px] rounded-xl text-xs font-semibold cursor-pointer transition-all border-none ${
						activePeriod === "today"
							? "bg-teal-deep text-white shadow-xs"
							: "bg-transparent text-subtext hover:text-charcoal hover:bg-grey100/60"
					}`}
				>
					Hari Ini
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setActivePeriod("week")}
					aria-pressed={activePeriod === "week"}
					className={`flex-1 min-h-[44px] rounded-xl text-xs font-semibold cursor-pointer transition-all border-none ${
						activePeriod === "week"
							? "bg-teal-deep text-white shadow-xs"
							: "bg-transparent text-subtext hover:text-charcoal hover:bg-grey100/60"
					}`}
				>
					Minggu Ini
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setActivePeriod("month")}
					aria-pressed={activePeriod === "month"}
					className={`flex-1 min-h-[44px] rounded-xl text-xs font-semibold cursor-pointer transition-all border-none ${
						activePeriod === "month"
							? "bg-teal-deep text-white shadow-xs"
							: "bg-transparent text-subtext hover:text-charcoal hover:bg-grey100/60"
					}`}
				>
					Bulan Ini
				</Button>
			</div>

			{/* Metric Hero Card */}
			<div className="w-full rounded-3xl p-5 bg-teal-mid text-white shadow-lg flex flex-col gap-3">
				<div className="flex justify-between items-center">
					<span className="text-xs font-medium text-grey300 flex items-center gap-1.5">
						<TrendingDown className="size-4 text-lime" />
						{activePeriod === "today"
							? "Pengeluaran Hari Ini"
							: activePeriod === "week"
								? "Akumulasi Minggu Ini"
								: "Akumulasi Bulan Ini"}
					</span>
					<span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-deep/50 text-lime">
						{filteredTransactions.length} Transaksi
					</span>
				</div>

				<div>
					<p className="text-3xl font-extrabold tracking-tight text-grey100">
						IDR {totalExpense.toLocaleString("id-ID")}
					</p>
					{activePeriod !== "today" && (
						<p className="text-xs text-grey300 mt-1 font-medium">
							Rata-rata: IDR {avgDaily.toLocaleString("id-ID")} / hari
						</p>
					)}
				</div>
			</div>

			{/* Detailed Breakdown Header */}
			<div className="flex justify-between items-center pt-2">
				<h3 className="font-bold text-base text-teal-deep flex items-center gap-2">
					<Receipt className="size-4.5 text-teal" />
					Rincian Pengeluaran
				</h3>
				<Link
					href="/transactions"
					className="text-xs font-semibold text-teal hover:underline flex items-center gap-0.5"
				>
					+ Catat Baru <ArrowUpRight className="size-3.5" />
				</Link>
			</div>

			{/* Transaction List */}
			{filteredTransactions.length === 0 ? (
				<div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-3 bg-white rounded-2xl border border-grey300/50 p-6">
					<Calendar className="size-10 text-grey300" />
					<p className="font-medium text-sm text-charcoal">
						Belum ada pengeluaran
					</p>
					<p className="text-xs text-subtext max-w-xs">
						Tidak ada catatan pengeluaran pada periode {activePeriod === "today" ? "hari ini" : activePeriod === "week" ? "minggu ini" : "bulan ini"}.
					</p>
					<Link href="/transactions">
						<Button
							type="button"
							variant="solid"
							size="sm"
							className="mt-2 flex items-center gap-1.5 min-h-[44px] cursor-pointer"
						>
							<CirclePlus className="size-4" /> Catat Pengeluaran
						</Button>
					</Link>
				</div>
			) : (
				<div className="flex flex-col gap-2.5 pb-8">
					{filteredTransactions.map((tx) => (
						<div
							key={tx.id}
							className="p-3.5 rounded-2xl bg-white border border-grey300/60 shadow-xs flex justify-between items-center gap-3"
						>
							<div className="flex flex-col gap-0.5 min-w-0">
								<div className="flex items-center gap-1.5 flex-wrap">
									<span className="text-xs font-bold text-charcoal capitalize truncate">
										{tx.categoryName}
									</span>
									<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal/10 text-teal-deep uppercase">
										{tx.pocketName}
									</span>
								</div>
								{tx.note && (
									<p className="text-xs text-subtext truncate">
										{tx.note}
									</p>
								)}
								<p className="text-[11px] text-grey500 font-medium">
									{formatDisplayDate(tx.transactionDate)}
								</p>
							</div>

							<div className="text-right shrink-0">
								<p className="font-bold text-error text-sm">
									- IDR {Number(tx.amount).toLocaleString("id-ID")}
								</p>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
