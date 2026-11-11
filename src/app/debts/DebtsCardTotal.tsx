import type { Debt } from "@/db/schema";

interface DebtsCardTotalProps {
	debts: Debt[];
}

export function DebtsCardTotal({ debts }: DebtsCardTotalProps) {
	const totalDebt = debts.reduce(
		(sum, debt) => sum + Number(debt.totalAmount || 0),
		0,
	);
	const totalPaid = debts.reduce(
		(sum, debt) => sum + Number(debt.paidAmount || 0),
		0,
	);
	const totalRemaining = Math.max(0, totalDebt - totalPaid);
	const progressPercent =
		totalDebt > 0 ? Math.min(100, Math.round((totalPaid / totalDebt) * 100)) : 0;

	return (
		<div className="w-full rounded-2xl shadow-md bg-teal-mid flex flex-col gap-3 px-6 py-5 text-grey300">
			<span className="font-semibold text-lg text-grey300">Total Remaining</span>
			<h1 className="text-3xl font-extrabold text-grey100 tracking-tight">
				IDR {totalRemaining.toLocaleString("id-ID")}
			</h1>

			{/* Progress Bar Container */}
			<div className="w-full flex flex-col gap-2 pt-1">
				<div
					className="w-full bg-teal-deep/30 h-3 rounded-full overflow-hidden"
					role="progressbar"
					aria-valuenow={progressPercent}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Persentase total pembayaran hutang"
				>
					<div
						className="bg-lime h-full rounded-full transition-all duration-300"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
				<p className="text-xs text-grey300 font-medium">
					{progressPercent}% paid of IDR {totalDebt.toLocaleString("id-ID")}
				</p>
			</div>
		</div>
	);
}
