"use client";

import { useState } from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type { Pocket } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff } from "lucide-react";

import walletLogo from "../../public/assets/empty-wallet.svg";
import chip from "../../public/assets/Circuit.svg";

export const pocketCardVariants = cva(
  "relative w-full rounded-xl shadow-lg border border-teal-deep/10 flex flex-col justify-between overflow-hidden",
  {
    variants: {
      size: {
        default: "p-5 gap-3",
        sm: "p-4 gap-2 min-h-36",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface PocketCardProps
  extends VariantProps<typeof pocketCardVariants> {
  pocket: Pocket;
  userName: string;
  index?: number;
  className?: string;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export const CARD_BG_COLORS = [
  "bg-lime",
  "bg-aqua-light",
  "bg-violet",
  "bg-pink",
] as const;

export function getCardBgColor(id: string, index: number = 0) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CARD_BG_COLORS[(Math.abs(hash) + index) % CARD_BG_COLORS.length];
}

export function PocketCard({
  pocket,
  userName,
  index = 0,
  className = "",
  isVisible: externalIsVisible,
  onToggleVisibility,
  size = "default",
}: PocketCardProps) {
  const [internalIsVisible, setInternalIsVisible] = useState(false);

  const isControlled = externalIsVisible !== undefined;
  const isVisible = isControlled ? externalIsVisible : internalIsVisible;
  const isSm = size === "sm";

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleVisibility) {
      onToggleVisibility();
    }
    if (!isControlled) {
      setInternalIsVisible((prev) => !prev);
    }
  };

  const bgColor = getCardBgColor(pocket.userId || pocket.id, index);

	return (
		<div className={cn(pocketCardVariants({ size, className }), bgColor)}>
		<span className="flex items-center">
			<h1
			className={`text-teal-deep font-bold leading-tight truncate z-10 ${
				isSm ? "text-base" : "text-lg"
			}`}
			>
			IDR{" "}
			{isVisible
				? `${Number(pocket.balance || 0).toLocaleString("id-ID")}, 00`
				: "* * * * * * * *"}
			</h1>
			<Button
			onClick={handleToggle}
			variant={"icon"}
			size={"icon"}
			className={`text-teal-deep cursor-pointer ${isSm ? "size-7" : ""}`}
			aria-label={isVisible ? "Sembunyikan saldo" : "Tampilkan saldo"}
			>
			{isVisible ? (
				<EyeOff className={isSm ? "size-4" : undefined} />
			) : (
				<Eye className={isSm ? "size-4" : undefined} />
			)}
			</Button>
		</span>

		<div className="w-full flex justify-between items-center z-10">
			<Image
			src={chip}
			alt="sim-chip"
			className={`${
				isSm ? "h-7" : "h-10"
			} w-auto object-contain shrink-0`}
			/>
			<Image
			src={walletLogo}
			alt="empty-wallet-logo"
			className={`${
				isSm ? "h-16" : "h-24"
			} w-auto object-contain shrink-0`}
			/>
		</div>

		<h1
			className={`text-teal-mid font-bold leading-tight uppercase truncate z-10 ${
			isSm ? "text-xs" : "text-[14px]"
			}`}
		>
			{pocket.name} - {userName}
		</h1>
		</div>
	);
}

export const pocketCardSkeletonVariants = cva(
  "w-full rounded-xl flex flex-col justify-between bg-grey100",
  {
    variants: {
      size: {
        default: "p-5 gap-3",
        sm: "p-4 gap-2 min-h-36",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export function PocketCardSkeleton({
  size = "default",
  className,
}: VariantProps<typeof pocketCardSkeletonVariants> & { className?: string }) {
  const isSm = size === "sm";

  return (
    <div className={cn(pocketCardSkeletonVariants({ size, className }))}>
      <div className="flex items-center gap-2">
        <Skeleton className={`w-40 ${isSm ? "h-5" : "h-6"}`} />
        <Skeleton className={`rounded-md ${isSm ? "size-5" : "size-6"}`} />
      </div>

      <div className="w-full flex justify-between items-center">
        <Skeleton className={`rounded-md ${isSm ? "h-7 w-9" : "h-10 w-12"}`} />
        <Skeleton className={`rounded-xl ${isSm ? "size-16" : "size-24"}`} />
      </div>

      <Skeleton className={`w-48 ${isSm ? "h-3.5" : "h-4"}`} />
    </div>
  );
}
