"use client";

import { useState } from "react";
import type { Debt, Pocket } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { CirclePlus, HandCoins } from "lucide-react";
import DebtsContainerSkeleton from "./DebtsContainerSkeleton";
import { AddDebtDrawer } from "./AddDebtDrawer";
import { RepayDebtDrawer } from "./RepayDebtDrawer";

import Image from "next/image";
import EmptyLogo from "../../../public/assets/skate.svg";

interface DebtsContainerProps {
	debts: Debt[];
	pockets: Pocket[];
}

export { DebtsContainerSkeleton };

export default function DebtsContainer({ debts, pockets }: DebtsContainerProps) {
	const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
	const [selectedDebtForRepay, setSelectedDebtForRepay] = useState<Debt | null>(
		null,
	);

	return (
		<section className="w-full flex-1 flex flex-col gap-2 px-5 py-8 bg-mist rounded-tl-4xl rounded-tr-4xl min-h-[80vh]">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold text-teal-deep">Loan/Debts Lists</h2>
			</div>

			{debts.length === 0 ? (
				<EmptyState onAdd={() => setIsAddDrawerOpen(true)} />
			) : (
				<div className="flex flex-col gap-2 flex-1">
					{debts.map((debt) => {
						const total = Number(debt.totalAmount);
						const paid = Number(debt.paidAmount);
						const remaining = Math.max(0, total - paid);
						const isPaidOff = remaining === 0 || debt.status === "paid";
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
									{!isPaidOff && (
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setSelectedDebtForRepay(debt)}
											aria-label={`Bayar hutang ${debt.creditorName}`}
											className="flex items-center gap-1.5 text-xs font-semibold text-teal-deep border-teal/40 hover:bg-teal/10 min-h-[36px] px-3 cursor-pointer"
										>
											<HandCoins className="size-3.5" /> Bayar
										</Button>
									)}
								</div>

								<div className="flex gap-1 justify-between items-baseline w-full">
									<p className="font-semibold text-charcoal">{debt.creditorName}</p>
									<p className="font-bold text-error text-xl">
										IDR {remaining.toLocaleString("id-ID")}
									</p>
								</div>

								<div className="w-full flex items-center gap-2">
									<div
										className="flex-1 bg-grey300 h-3 rounded-full overflow-hidden"
										role="progressbar"
										aria-valuenow={progressPercent}
										aria-valuemin={0}
										aria-valuemax={100}
										aria-label={`Persentase pembayaran hutang ${debt.creditorName}`}
									>
										<div
											className="bg-lime h-full rounded-full transition-all duration-300"
											style={{ width: `${progressPercent}%` }}
										/>
									</div>
									<div className="text-xs text-subtext w-fit font-medium">
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
							onClick={() => setIsAddDrawerOpen(true)}
							className={"w-full flex items-center gap-2 cursor-pointer"}
						>
							<CirclePlus /> Add List
						</Button>
					</section>
				</div>
			)}

			<AddDebtDrawer
				isOpen={isAddDrawerOpen}
				onClose={() => setIsAddDrawerOpen(false)}
			/>

			<RepayDebtDrawer
				debt={selectedDebtForRepay}
				pockets={pockets}
				isOpen={selectedDebtForRepay !== null}
				onClose={() => setSelectedDebtForRepay(null)}
			/>
		</section>
	);
}

export function EmptyState({ onAdd }: { onAdd?: () => void }) {
	return (
		<div className="flex-1 flex flex-col items-center justify-center text-center py-8 gap-4 text-subtext">
			<h3 className="font-medium text-base text-charcoal">Belum ada daftar hutang</h3>
			<p className="text-xs text-subtext max-w-xs">
				Semua catatan pinjaman atau hutang yang Anda tambahkan akan muncul di sini.
			</p>
			<Image
				src={EmptyLogo}
				alt="Belum ada data hutang"
				className="h-44 w-auto object-contain my-2"
			/>
			{onAdd && (
				<Button
					type="button"
					variant="solid"
					size="lg"
					onClick={onAdd}
					className="flex items-center gap-2 cursor-pointer mt-2"
				>
					<CirclePlus className="size-5" /> Tambah Hutang Baru
				</Button>
			)}
		</div>
	);
}