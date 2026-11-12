"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Pocket } from "@/db/schema";
import { createTransferAction } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import Numpad from "@/components/ui/numpad";
import { PocketSelector } from "@/components/PocketSelector";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const MAX_AMOUNT_DIGITS = 11;

interface TransferContainerProps {
	pockets: Pocket[];
}

type ToastVariant = "error" | "warning" | "success" | "info";

interface ToastState {
	id: number;
	isOpen: boolean;
	message: string;
	variant: ToastVariant;
}

function formatPocketLabel(name: string): string {
	return name.toUpperCase();
}

function formatRupiahInput(rawDigits: string): string {
	if (!rawDigits) return "";
	const numeric = Number(rawDigits);
	if (Number.isNaN(numeric)) return "";
	return numeric.toLocaleString("id-ID");
}

export default function TransferContainer({ pockets }: TransferContainerProps) {
	const router = useRouter();
	const [state, formAction, isPending] = useActionState(
		createTransferAction,
		null,
	);

	const [selectedPocketId, setSelectedPocketId] = useState<string>(
		pockets[0]?.id ?? "",
	);
	const [targetPocketId, setTargetPocketId] = useState<string | null>(null);
	const [note, setNote] = useState<string>("");
	const [amount, setAmount] = useState<string>("");
	const [isNumpadOpen, setIsNumpadOpen] = useState<boolean>(false);

	const [toast, setToast] = useState<ToastState>({
		id: 0,
		isOpen: false,
		message: "",
		variant: "error",
	});

	const triggerToast = (message: string, variant: ToastVariant = "error") => {
		setToast((prev) => ({
			id: prev.id + 1,
			isOpen: true,
			message,
			variant,
		}));
	};

	useEffect(() => {
		if (state?.error) {
			triggerToast(state.error, "error");
		} else if (state?.warning) {
			triggerToast(state.warning, "warning");
		}
	}, [state]);

	const amountFieldRef = useRef<HTMLDivElement | null>(null);
	const amountInputRef = useRef<HTMLInputElement | null>(null);
	const numpadDrawerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!isNumpadOpen) return;

		const timer = setTimeout(() => {
			amountFieldRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}, 120);

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
			if (document.activeElement === amountInputRef.current) {
				amountInputRef.current?.blur();
			}
		};

		document.addEventListener("pointerdown", handlePointerDownOutside);
		return () => {
			clearTimeout(timer);
			document.removeEventListener("pointerdown", handlePointerDownOutside);
		};
	}, [isNumpadOpen]);

	const destinationPockets = pockets.filter(
		(pocket) => pocket.id !== selectedPocketId,
	);

	const destinationPocketItems = Object.fromEntries(
		destinationPockets.map((pocket) => [
			pocket.id,
			formatPocketLabel(pocket.name),
		]),
	);

	const handleSelectSourcePocket = (pocketId: string) => {
		setSelectedPocketId(pocketId);
		if (targetPocketId === pocketId) {
			setTargetPocketId(null);
		}
	};

	const formattedAmount = formatRupiahInput(amount);
	const amountTextSizeClass =
		amount.length > 9
			? "text-2xl"
			: amount.length > 7
				? "text-3xl"
				: "text-4xl";

	const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === "Escape") {
			e.preventDefault();
			setIsNumpadOpen(false);
			return;
		}
		if (e.key === "Backspace") {
			e.preventDefault();
			setAmount((prev) => prev.slice(0, -1));
			return;
		}
		if (/^[0-9]$/.test(e.key)) {
			e.preventDefault();
			setAmount((prev) => {
				if (prev === "" && e.key === "0") return prev;
				if (prev.length >= MAX_AMOUNT_DIGITS) return prev;
				return prev + e.key;
			});
		}
	};

	return (
		<section
			className={`relative w-full flex flex-col gap-3 min-h-[80vh] px-7 pt-8 bg-white rounded-tl-4xl rounded-tr-4xl overflow-hidden transition-[padding] duration-200 ${
				isNumpadOpen ? "pb-88" : "pb-8"
			}`}
		>
			<PocketSelector
				pockets={pockets}
				selectedPocketId={selectedPocketId}
				onSelectPocket={handleSelectSourcePocket}
			/>

			<form
				action={formAction}
				onSubmit={() => setIsNumpadOpen(false)}
				className="w-full flex-1 flex flex-col gap-3 min-h-0"
			>
				<input type="hidden" name="pocketId" value={selectedPocketId} />
				<input type="hidden" name="amount" value={amount} />

				{/* Destination pocket selector area */}
				<section className="flex flex-col gap-1.5 shrink-0">
					<label
						htmlFor="relatedPocketId"
						className="font-semibold text-[15px] text-teal-deep"
					>
						Destination Pocket
					</label>
					<Select
						id="relatedPocketId"
						name="relatedPocketId"
						required
						items={destinationPocketItems}
						value={targetPocketId}
						onValueChange={(value) => setTargetPocketId(value)}
					>
						<SelectTrigger className="w-full h-auto! px-3 py-3 rounded-xl border-grey500 text-base">
							<SelectValue placeholder="Select Pocket..." />
						</SelectTrigger>
						<SelectContent alignItemWithTrigger={false}>
							<SelectGroup>
								{destinationPockets.map((pocket) => (
									<SelectItem key={pocket.id} value={pocket.id}>
										{formatPocketLabel(pocket.name)}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</section>

				<section className="flex flex-col gap-1.5 shrink-0">
					<label
						htmlFor="note"
						className="font-semibold text-[15px] text-teal-deep"
					>
						Notes
					</label>
					<input
						id="note"
						name="note"
						type="text"
						required
						enterKeyHint="done"
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Notes..."
						className="px-3 py-3 rounded-xl border border-grey500 w-full text-base outline-none focus:border-teal-deep focus:ring-1 focus:ring-teal-deep transition-all"
					/>
				</section>

				<section className="flex flex-col gap-1.5 shrink-0">
					<label
						htmlFor="amount-display"
						className="font-semibold text-[15px] text-teal-deep"
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
							ref={amountInputRef}
							id="amount-display"
							type="text"
							readOnly
							inputMode="none"
							value={formattedAmount}
							onFocus={() => setIsNumpadOpen(true)}
							onKeyDown={handleAmountKeyDown}
							placeholder="0"
							className={`w-full ${amountTextSizeClass} text-charcoal font-extrabold tracking-tight bg-transparent outline-none placeholder:text-grey300 text-right caret-transparent cursor-pointer transition-all`}
						/>
					</div>
				</section>

				<section className="mt-auto pt-4 flex gap-3 items-center w-full shrink-0">
					<Button
						type="button"
						variant="outline"
						size="lg"
						disabled={isPending}
						onClick={() => router.back()}
						className="flex-1"
					>
						Batal
					</Button>
					<Button
						type="submit"
						variant="solid"
						size="lg"
						disabled={isPending}
						className="flex-1"
					>
						{isPending ? "Processing..." : "Transfer"}
					</Button>
				</section>

				{toast.isOpen && (
					<Toast
						key={toast.id}
						variant={toast.variant}
						position="top-center"
						isOpen={toast.isOpen}
						onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
						message={toast.message}
					/>
				)}
			</form>

			<AnimatePresence>
				{isNumpadOpen && (
					<motion.div
						ref={numpadDrawerRef}
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ type: "spring", stiffness: 420, damping: 34 }}
						className="fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl border-t border-grey300 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] p-4"
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
		</section>
	);
}

export function TransferContainerSkeleton() {
	return (
		<section className="w-full flex flex-col gap-3 min-h-[80vh] px-7 py-8 bg-white rounded-tl-4xl rounded-tr-4xl">
			<div className="flex items-center gap-2">
				{[1, 2, 3, 4].map((item) => (
					<Skeleton key={item} className="h-9 w-16 rounded-lg" />
				))}
			</div>

			<div className="flex flex-col gap-1.5">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-12 w-full rounded-xl" />
			</div>

			<div className="flex flex-col gap-1.5">
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-12 w-full rounded-xl" />
			</div>

			<div className="flex flex-col gap-1.5">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-16 w-full rounded-xl" />
			</div>

			<div className="mt-auto pt-4 flex gap-3 items-center w-full">
				<Skeleton className="h-12 flex-1 rounded-lg" />
				<Skeleton className="h-12 flex-1 rounded-lg" />
			</div>
		</section>
	);
}
