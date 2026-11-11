"use client";

import type { Debt } from "@/db/schema";
import DebtsContainerSkeleton from "./DebtsContainerSkeleton";

interface DebtsContainerProps {
	debts: Debt[];
}

export { DebtsContainerSkeleton };

export default function DebtsContainer({ debts }: DebtsContainerProps) {
	return (
		<section className="w-full flex-1 flex flex-col gap-4 px-7 py-8 bg-white rounded-tl-4xl rounded-tr-4xl min-h-[80vh]">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold text-teal-deep">Daftar Hutang</h2>
			</div>

			{debts.length === 0 ? (
				<div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-grey500">
					<p className="text-sm font-medium">Belum ada data hutang.</p>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{debts.map((debt) => (
						<div
							key={debt.id}
							className="p-4 rounded-2xl border border-grey300 flex justify-between items-center"
						>
							<div className="flex flex-col gap-1">
								<p className="font-semibold text-charcoal">{debt.creditorName}</p>
								<p className="text-xs text-grey500">
									Jatuh tempo: {debt.dueDate ?? "-"}
								</p>
							</div>
							<div className="flex flex-col items-end gap-1">
								<p className="font-bold text-teal-deep">
									IDR {Number(debt.totalAmount).toLocaleString("id-ID")}
								</p>
								<span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize bg-teal/10 text-teal-deep">
									{debt.status}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
