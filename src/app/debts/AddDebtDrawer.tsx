"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { createDebtAction } from "@/app/actions/debts";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import Numpad from "@/components/ui/numpad";

interface AddDebtDrawerProps {
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

export function AddDebtDrawer({ isOpen, onClose }: AddDebtDrawerProps) {
	const [state, formAction, isPending] = useActionState(createDebtAction, null);

	const [creditorName, setCreditorName] = useState("");
	const [totalAmount, setTotalAmount] = useState("");
	const [paidAmount, setPaidAmount] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [isNumpadOpen, setIsNumpadOpen] = useState(false);

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
			setCreditorName("");
			setTotalAmount("");
			setPaidAmount("");
			setDueDate("");
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

	const formattedTotalAmount = formatRupiahInput(totalAmount);
	const amountTextSizeClass =
		totalAmount.length > 9
			? "text-2xl"
			: totalAmount.length > 7
				? "text-3xl"
				: "text-4xl";

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
							aria-labelledby="add-debt-title"
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", stiffness: 380, damping: 32 }}
							className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-4xl max-h-[92vh] flex flex-col p-6 shadow-2xl overflow-y-auto transition-[padding] duration-200 ${
								isNumpadOpen ? "pb-88" : "pb-6"
							}`}
						>
							<div className="w-12 h-1 bg-grey300 rounded-full mx-auto mb-4 shrink-0" />

							<div className="flex justify-between items-center mb-5 shrink-0">
								<h2 id="add-debt-title" className="text-xl font-bold text-teal-deep">
									Add Loan
								</h2>
								<Button
									type="button"
									variant="icon"
									size="icon-sm"
									aria-label="Tutup form tambah hutang"
									onClick={() => {
										setIsNumpadOpen(false);
										onClose();
									}}
									className="p-1 text-subtext hover:text-charcoal cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full"
								>
									<X className="size-5" />
								</Button>
							</div>

							<form
								action={formAction}
								onSubmit={() => setIsNumpadOpen(false)}
								className="flex flex-col gap-4"
							>
								<input type="hidden" name="totalAmount" value={totalAmount} />
								<input type="hidden" name="paidAmount" value={paidAmount || "0"} />

								{/* Entry Name */}
								<div className="flex flex-col gap-1.5">
									<label
										htmlFor="creditorName"
										className="font-semibold text-sm text-teal-deep"
									>
										Entry Name
									</label>
									<input
										id="creditorName"
										name="creditorName"
										type="text"
										required
										placeholder="e.g. Cicilan Motor, Budi, dsb"
										value={creditorName}
										onFocus={() => setIsNumpadOpen(false)}
										onChange={(e) => setCreditorName(e.target.value)}
										className="px-3.5 py-3 rounded-xl border border-grey300 text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-teal text-base"
									/>
								</div>

								{/* Amount Input with Numpad Trigger */}
								<div className="flex flex-col gap-1.5">
									<label
										htmlFor="amount-display"
										className="font-semibold text-sm text-teal-deep"
									>
										Amount
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
											id="amount-display"
											type="text"
											readOnly
											inputMode="none"
											aria-haspopup="dialog"
											aria-expanded={isNumpadOpen}
											value={formattedTotalAmount}
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
										disabled={isPending || !totalAmount || Number(totalAmount) <= 0 || !creditorName.trim()}
										className="flex-1 cursor-pointer"
									>
										{isPending ? "Menyimpan..." : "Simpan Hutang"}
									</Button>
								</div>
							</form>
						</motion.div>

						{/* Overlay Numpad Drawer */}
						<AnimatePresence>
							{isNumpadOpen && (
								<motion.div
									id="amount-numpad"
									ref={numpadDrawerRef}
									initial={{ y: "100%" }}
									animate={{ y: 0 }}
									exit={{ y: "100%" }}
									transition={{ type: "spring", stiffness: 420, damping: 34 }}
									className="fixed inset-x-0 bottom-0 z-60 bg-white rounded-t-3xl border-t border-grey300 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] p-4"
								>
									<Numpad
										value={totalAmount}
										onChange={setTotalAmount}
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
