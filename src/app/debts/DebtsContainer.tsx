"use client";

import { useState } from "react";
import type { Debt } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import DebtsContainerSkeleton from "./DebtsContainerSkeleton";
import { AddDebtDrawer } from "./AddDebtDrawer";

import Image from "next/image";
import EmptyLogo  from "../../../public/assets/skate.svg";

interface DebtsContainerProps {
	debts: Debt[];
}

export { DebtsContainerSkeleton };

export default function DebtsContainer({ debts }: DebtsContainerProps) {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<section className="w-full flex-1 flex flex-col gap-2 px-5 py-8 bg-mist rounded-tl-4xl rounded-tr-4xl min-h-[80vh]">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold text-teal-deep">Loan/Debts Lists</h2>
			</div>

			{debts.length === 0 ? (
				<EmptyState/>
			) : (
				<div className="flex flex-col gap-2 flex-1">
					{debts.map((debt) => {
						const total = Number(debt.totalAmount);
						const paid = Number(debt.paidAmount);
						const remaining = Math.max(0, total - paid);
						const progressPercent =
							total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

						return (
							<div
								key={debt.id}
								className="p-4 rounded-2xl shadow-xl flex flex-col gap-2.5 items-start bg-white"
							>
								<div className="flex justify-between items-center w-full">
									<span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize bg-teal/10 text-teal-deep">
										{debt.status}
									</span>
								</div>

								<div className="flex gap-1 justify-between items-baseline w-full">
									<p className="font-semibold text-charcoal">{debt.creditorName}</p>
									<p className="font-bold text-error text-xl">
										IDR {remaining.toLocaleString("id-ID")}
									</p>
								</div>

								<div className="w-full flex items-center gap-2">
									<div className="flex-1 bg-grey300 h-3 rounded-full overflow-hidden">
										<div
											className="bg-lime h-full rounded-full transition-all duration-300"
											style={{ width: `${progressPercent}%` }}
										/>
									</div>
									<div className="text-xs text-grey500 w-fit font-medium">
										<span>{progressPercent}% dibayar</span>
									</div>
								</div>
							</div>
						);
					})}
				<section className="w-full pt-2">
					<Button
						type="button"
						variant={"solid"}
						size={"lg"}
						onClick={() => setIsDrawerOpen(true)}
						className={"w-full flex items-center gap-2 cursor-pointer"}
					>
						<CirclePlus /> Add List
					</Button>
				</section>
				</div>
			)}

			<AddDebtDrawer
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
			/>
		</section>
	);
}

export function EmptyState() {
	return(
		<div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-4 text-subtext">
			<h1 className="font-medium">Congrats, you ain't got no Loan/Debts</h1>
			<Image
            src={EmptyLogo}
            alt="empty-state"
            className="h-52 w-auto object-contain"
        	/>
		</div>
	)
}