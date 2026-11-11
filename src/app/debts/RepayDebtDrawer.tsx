"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { Debt, Pocket } from "@/db/schema";
import { repayDebtAction } from "@/app/actions/debts";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import Numpad from "@/components/ui/numpad";

import bcaLogo from "../../../public/assets/BCA.webp";
import bniLogo from "../../../public/assets/BNI.webp";
import mandiriLogo from "../../../public/assets/mandiri.webp";
import spayLogo from "../../../public/assets/spay.webp";

const POCKET_LOGO_MAP: Record<string, StaticImageData> = {
	bca: bcaLogo,
	bni: bniLogo,
	mandiri: mandiriLogo,
	spay: spayLogo,
};

interface RepayDebtDrawerProps {
	debt: Debt | null;
	pockets: Pocket[];
	isOpen: boolean;
	onClose: () => void;
}

const MAX_AMOUNT_DIGITS = 11;

function formatRupiahInput(rawDigits: string): string {
	if (!rawDigits) return "";
	const numeric = Number(rawDigits);
	if (Number.isNaN(numeric)) return "";
	return numeric.toLocaleString("id-ID");
}

export function RepayDebtDrawer({
	debt,
	pockets,
	isOpen,
	onClose,
}: RepayDebtDrawerProps) {
	const [state, formAction, isPending] = useActionState(repayDebtAction, null);

	const [selectedPocketId, setSelectedPocketId] = useState<string>(
		pockets[0]?.id ?? "",
	);
	const [amount, setAmount] = useState("");
	const [isNumpadOpen, setIsNumpadOpen] = useState(false);

	useEffect(() => {
		if (
			pockets.length > 0 &&
			(!selectedPocketId || !pockets.some((p) => p.id === selectedPocketId))
		) {
			setSelectedPocketId(pockets[0].id);
		}
	}, [pockets, selectedPocketId]);

	const amountFieldRef = useRef<HTMLDivElement | null>(null);
	const numpadDrawerRef = useRef<HTMLDivElement | null>(null);

	const [toast, setToast] = useState<{
		isOpen: boolean;
		message: string;
		variant: "error" | "success";
	}>({
		isOpen: false,
		message: "",
		variant: "error",
	});

	useEffect(() => {
		if (state?.success) {
			setAmount("");
			setIsNumpadOpen(false);
			onClose();
		} else if (state?.error) {
			setToast({
				isOpen: true,
				message: state.error,
				variant: "error",
			});
		}
	}, [state, onClose]);

	useEffect(() => {
		if (!isNumpadOpen) return;

		const handlePointerDownOutside = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (!target) return;

			if (
				numpadDrawerRef.current?.contains(target) ||
				amountFieldRef.current?.contains(target)
			) {
				return;
			}

			setIsNumpadOpen(false);
		};

		document.addEventListener("pointerdown", handlePointerDownOutside);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDownOutside);
		};
	}, [isNumpadOpen]);

	// Escape key listener to close numpad or drawer (A11y R-32)
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				if (isNumpadOpen) {
					setIsNumpadOpen(false);
				} else {
					onClose();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, isNumpadOpen, onClose]);

	if (!debt) return null;

	const totalAmount = Number(debt.totalAmount);
	const paidAmount = Number(debt.paidAmount || 0);
	const remaining = Math.max(0, totalAmount - paidAmount);

	const formattedAmount = formatRupiahInput(amount);
	const amountTextSizeClass =
		amount.length > 9
			? "text-2xl"
			: amount.length > 7
				? "text-3xl"
				: "text-4xl";

	const handlePayFull = () => {
		setAmount(String(remaining));
	};

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => {
								setIsNumpadOpen(false);
								onClose();
							}}
							className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
						/>

						{/* Bottom Drawer */}
						<motion.div
							role="dialog"
							aria-modal="true"
							aria-labelledby="repay-debt-title"
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", stiffness: 380, damping: 32 }}
							className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-4xl max-h-[92vh] flex flex-col p-6 shadow-2xl overflow-y-auto transition-[padding] duration-200 ${
								isNumpadOpen ? "pb-88" : "pb-6"
							}`}
						>
							<div className="w-12 h-1 bg-grey300 rounded-full mx-auto mb-4 shrink-0" />

							<div className="flex justify-between items-center mb-4 shrink-0">
								<div>
									<h2 id="repay-debt-title" className="text-xl font-bold text-teal-deep">
										Bayar Hutang
									</h2>
									<p className="text-xs text-subtext mt-0.5">
										{debt.creditorName}
									</p>
								</div>
								<Button
									type="button"
									variant="icon"
									size="icon-sm"
									aria-label="Tutup form pembayaran hutang"
									onClick={() => {
										setIsNumpadOpen(false);
										onClose();
									}}
									className="p-1 text-subtext hover:text-charcoal cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
								>
									<X className="size-5" />
								</Button>
							</div>

							{/* Summary Card Info */}
							<div className="rounded-2xl bg-mist p-4 border border-grey300/50 flex flex-col gap-2 mb-4">
								<div className="flex justify-between items-center text-xs text-subtext">
									<span>Sisa:</span>
									<span className="font-bold text-error text-sm">
										IDR {remaining.toLocaleString("id-ID")}
									</span>
								</div>
								<div className="flex justify-between items-center text-xs text-subtext">
									<span>Total:</span>
									<span className="font-semibold text-charcoal">
										IDR {totalAmount.toLocaleString("id-ID")}
									</span>
								</div>
								<div className="flex justify-end pt-1">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handlePayFull}
										className="text-xs font-semibold text-teal-deep border-teal/40 bg-teal/5 hover:bg-teal/10 min-h-[36px] cursor-pointer"
									>
										Bayar Lunas
									</Button>
								</div>
							</div>

							<form
								action={formAction}
								onSubmit={() => setIsNumpadOpen(false)}
								className="flex flex-col gap-4"
							>
								<input type="hidden" name="debtId" value={debt.id} />
								<input type="hidden" name="pocketId" value={selectedPocketId} />
								<input type="hidden" name="amount" value={amount} />

								{/* Source Pocket Selector */}
								<div className="flex flex-col gap-1.5">
									<label className="font-semibold text-sm text-teal-deep">
										Sumber Dana (Pocket)
									</label>
									<div className="flex items-center gap-2 overflow-x-auto pb-1">
										{pockets.map((pocket) => {
											const isSelected = selectedPocketId === pocket.id;
											const logo = POCKET_LOGO_MAP[pocket.name.toLowerCase()];

											return (
												<Button
													key={pocket.id}
													type="button"
													variant="outline"
													onClick={() => setSelectedPocketId(pocket.id)}
													className={`h-9 py-2 transition-all cursor-pointer ${
														isSelected
															? "border-teal-mid bg-teal/10"
															: "opacity-70 hover:opacity-100"
													}`}
												>
													{logo ? (
														<Image
															src={logo}
															alt={`${pocket.name}-logo`}
															className="h-full w-auto object-contain"
														/>
													) : (
														<span className="text-xs font-semibold uppercase text-teal-deep">
															{pocket.name}
														</span>
													)}
												</Button>
											);
										})}
									</div>
								</div>

								{/* Amount Input with Numpad Trigger */}
								<div className="flex flex-col gap-1.5">
									<label
										htmlFor="repay-amount-display"
										className="font-semibold text-sm text-teal-deep"
									>
										Nominal Pembayaran
									</label>
									<div
										ref={amountFieldRef}
										onClick={() => setIsNumpadOpen(true)}
										className={`flex items-center gap-2 px-3 py-3.5 rounded-xl border bg-white cursor-pointer transition-all ${
											isNumpadOpen
												? "border-teal-deep ring-1 ring-teal-deep"
												: "border-grey500 focus-within:border-teal-deep focus-within:ring-1 focus-within:ring-teal-deep"
										}`}
									>
										<span
											className={`${amountTextSizeClass} font-bold text-charcoal select-none transition-all`}
										>
											IDR
										</span>
										<input
											id="repay-amount-display"
											type="text"
											readOnly
											inputMode="none"
											aria-haspopup="dialog"
											aria-expanded={isNumpadOpen}
											value={formattedAmount}
											onFocus={() => setIsNumpadOpen(true)}
											placeholder="0"
											className={`w-full ${amountTextSizeClass} text-charcoal font-extrabold tracking-tight bg-transparent outline-none placeholder:text-grey300 text-right caret-transparent cursor-pointer transition-all`}
										/>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex gap-3 pt-3 mt-2">
									<Button
										type="button"
										variant="outline"
										size="lg"
										disabled={isPending}
										onClick={() => {
											setIsNumpadOpen(false);
											onClose();
										}}
										className="flex-1 cursor-pointer"
									>
										Batal
									</Button>
									<Button
										type="submit"
										variant="solid"
										size="lg"
										disabled={isPending || !amount || Number(amount) <= 0 || !selectedPocketId}
										className="flex-1 cursor-pointer"
									>
										{isPending ? "Memproses..." : "Konfirmasi Bayar"}
									</Button>
								</div>
							</form>
						</motion.div>

						{/* Overlay Numpad Drawer */}
						<AnimatePresence>
							{isNumpadOpen && (
								<motion.div
									id="repay-amount-numpad"
									ref={numpadDrawerRef}
									initial={{ y: "100%" }}
									animate={{ y: 0 }}
									exit={{ y: "100%" }}
									transition={{ type: "spring", stiffness: 420, damping: 34 }}
									className="fixed inset-x-0 bottom-0 z-60 bg-white rounded-t-3xl border-t border-grey300 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] p-4"
								>
									<Numpad
										value={amount}
										onChange={setAmount}
										maxLength={MAX_AMOUNT_DIGITS}
										allowDecimal={false}
										showTripleZero
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</>
				)}
			</AnimatePresence>

			{toast.isOpen && (
				<Toast
					variant={toast.variant}
					position="top-center"
					isOpen={toast.isOpen}
					onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
					message={toast.message}
				/>
			)}
		</>
	);
}
