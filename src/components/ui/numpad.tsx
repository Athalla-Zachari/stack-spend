"use client";

import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NumpadProps {
  value?: string;
  onChange: (value: string) => void;
  maxLength?: number;
  allowDecimal?: boolean;
  /** Tampilkan tombol cepat "000" di pojok kiri bawah saat allowDecimal={false} (cocok untuk Rupiah) */
  showTripleZero?: boolean;
  preserveLeadingZeros?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Numpad({
  value = "",
  onChange,
  maxLength = 11,
  allowDecimal = true,
  showTripleZero = false,
  preserveLeadingZeros = false,
  disabled = false,
  className,
}: NumpadProps) {
  const bottomLeftKey = allowDecimal ? "." : showTripleZero ? "000" : "";

  const keypadKeys: readonly string[] = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    bottomLeftKey, "0", "⌫",
  ];

  const handleKeyPress = (key: string): void => {
    if (disabled || !key) return;

    if (key === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }

    if (key === ".") {
      if (!allowDecimal || value.includes(".")) return;
      onChange(value === "" ? "0." : value + key);
      return;
    }

    // Mode nominal uang (tanpa leading zero & tanpa desimal): cegah angka diawali "0" atau "000"
    if (!preserveLeadingZeros && !allowDecimal && (value === "" || value === "0")) {
      if (key === "0" || key === "000") return;
      if (key.length > maxLength) return;
      onChange(key);
      return;
    }

    // Pastikan seluruh digit tombol ("000" maupun 1 digit) masih muat dalam batas maxLength
    if (value.length + key.length > maxLength) return;

    if (value === "0" && !preserveLeadingZeros) {
      onChange(key);
    } else {
      onChange(value + key);
    }
  };

	return (
		<div className={cn(
			"mx-auto w-full h-full grid grid-cols-3 grid-rows-4 gap-1.5",
			className
		)}
		>
		{keypadKeys.map((key, index) => {
			if (!key) {
			return <div key={`empty-${index}`} aria-hidden="true" className="w-full" />;
			}

			const isBackspace = key === "⌫";

			return (
			<button
				key={key}
				type="button"
				aria-label={isBackspace ? "Backspace" : undefined}
				onClick={() => handleKeyPress(key)}
				disabled={disabled}
				className={cn(
				"w-full h-full min-h-18 rounded-xl flex items-center justify-center font-bold select-none touch-manipulation cursor-pointer outline-none transition-all duration-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none",
				key === "000" ? "text-xl tracking-tight" : "text-3xl",
				isBackspace
					? "text-error hover:bg-error/10 active:bg-error/20 focus-visible:ring-2 focus-visible:ring-error"
					: "text-teal-deep hover:bg-aqua-light/25 active:bg-aqua-light/50 focus-visible:ring-2 focus-visible:ring-teal-mid"
				)}
			>
				{isBackspace ? <Delete className="size-7" /> : key}
			</button>
			);
		})}
		</div>
	);
}
