"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const toastVariants = cva(
	"w-max max-w-[90vw] sm:max-w-md px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2.5 pointer-events-auto",
	{
		variants: {
		variant: {
			error: "bg-error text-white",
			success: "bg-green text-white",
			warning: "bg-warning text-white",
			info: "bg-teal text-white",
			progress: "bg-teal-deep text-white",
		},
		},
		defaultVariants: {
		variant: "error",
		},
	}
);

const toastPositions = {
	"top-center": "fixed top-6 left-1/2 -translate-x-1/2 z-50",
	"bottom-right": "fixed bottom-6 right-6 z-50",
	inline: "relative w-max ml-auto",
} as const;

export type ToastPosition = keyof typeof toastPositions;

export interface ToastProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof toastVariants> {
	message?: React.ReactNode;
	position?: ToastPosition;
	isOpen?: boolean;
	duration?: number;
	onClose?: () => void;
	showIcon?: boolean;
	icon?: React.ReactNode;
}

const defaultIcons = {
	error: <AlertCircle className="size-4.5 shrink-0" />,
	success: <CheckCircle2 className="size-4.5 shrink-0" />,
	warning: <AlertTriangle className="size-4.5 shrink-0" />,
	info: <Info className="size-4.5 shrink-0" />,
	progress: <Loader2 className="size-4.5 shrink-0 animate-spin" />,
};

export function Toast({
	className,
	variant = "error",
	position = "bottom-right",
	duration,
	message,
	children,
	isOpen = true,
	onClose,
	showIcon = true,
	icon,
	...props
}: ToastProps) {
	const currentVariant = variant || "error";
	const displayedIcon = icon || (showIcon ? defaultIcons[currentVariant] : null);

	// Default duration: 4000ms (4 detik), kecuali variant "progress" default 0 (tidak otomatis hilang)
	const autoCloseDuration =
		duration !== undefined ? duration : currentVariant === "progress" ? 0 : 4000;

	const [isPaused, setIsPaused] = React.useState(false);
	const [internalDismissed, setInternalDismissed] = React.useState(false);
	const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);
	const [prevMessage, setPrevMessage] = React.useState(message);

	// Reset dismissal saat isOpen diaktifkan kembali atau pesan berubah
	if (prevIsOpen !== isOpen) {
		setPrevIsOpen(isOpen);
		if (isOpen) {
			setInternalDismissed(false);
		}
	}
	if (prevMessage !== message) {
		setPrevMessage(message);
		setInternalDismissed(false);
	}

	const handleClose = React.useCallback(() => {
		setInternalDismissed(true);
		onClose?.();
	}, [onClose]);

	// Auto-dismiss timeout
	React.useEffect(() => {
		const shouldShow = isOpen && !internalDismissed;
		if (!shouldShow || autoCloseDuration <= 0 || isPaused) return;

		const timer = setTimeout(() => {
			handleClose();
		}, autoCloseDuration);

		return () => clearTimeout(timer);
	}, [isOpen, internalDismissed, autoCloseDuration, isPaused, handleClose]);

	const motionVariants: Variants = {
		initial: {
		opacity: 0,
		scale: 0.92,
		y: position === "top-center" ? -24 : position === "bottom-right" ? 24 : 0,
		},
		animate: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 25,
		},
		},
		exit: {
		opacity: 0,
		scale: 0.92,
		y: position === "top-center" ? -16 : position === "bottom-right" ? 16 : 0,
		transition: { duration: 0.18 },
		},
	};

	const isVisible = isOpen && !internalDismissed;

	return (
		<AnimatePresence>
		{isVisible && (
			<div className={toastPositions[position]}>
			<motion.div
				role="status"
				aria-live="polite"
				variants={motionVariants}
				initial="initial"
				animate="animate"
				exit="exit"
				onMouseEnter={() => setIsPaused(true)}
				onMouseLeave={() => setIsPaused(false)}
				className={cn(toastVariants({ variant: currentVariant }), className)}
				{...(props as React.ComponentProps<typeof motion.div>)}
			>
				{displayedIcon}
				<div className="flex-1 leading-tight">{message || children}</div>
				{onClose && (
				<Button
					type="button"
					variant="icon"
					size="xxs"
					onClick={handleClose}
					className="text-white/80 hover:text-white hover:bg-white/10 rounded-md p-1 transition-colors cursor-pointer"
					aria-label="Tutup notifikasi"
				>
					<X className="size-4" />
				</Button>
				)}
			</motion.div>
			</div>
		)}
		</AnimatePresence>
	);
}

