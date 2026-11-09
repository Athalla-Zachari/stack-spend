"use client";

import { useState } from "react";
import Image from "next/image";
import type { Pocket } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff } from "lucide-react";

import walletLogo from "../../public/assets/empty-wallet.svg";
import chip from "../../public/assets/Circuit.svg";

export interface PocketCardProps {
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
}: PocketCardProps) {
  const [internalIsVisible, setInternalIsVisible] = useState(false);

  const isControlled = externalIsVisible !== undefined;
  const isVisible = isControlled ? externalIsVisible : internalIsVisible;

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
    <div
      className={`relative w-full rounded-xl shadow-lg border border-teal-deep/10 p-5 flex flex-col justify-between gap-3 ${bgColor} overflow-hidden ${className}`}
    >
      <span className="flex items-center">
        <h1 className="text-teal-deep text-lg font-bold leading-tight truncate z-10">
          IDR{" "}
          {isVisible
            ? `${Number(pocket.balance || 0).toLocaleString("id-ID")}, 00`
            : "* * * * * * * *"}
        </h1>
        <Button
          onClick={handleToggle}
          variant={"icon"}
          size={"icon"}
          className={"text-teal-deep cursor-pointer"}
          aria-label={isVisible ? "Sembunyikan saldo" : "Tampilkan saldo"}
        >
          {isVisible ? <EyeOff /> : <Eye />}
        </Button>
      </span>

      <div className="w-full flex justify-between items-center z-10">
        <Image
          src={chip}
          alt="sim-chip"
          className="h-10 w-auto object-contain shrink-0"
        />
        <Image
          src={walletLogo}
          alt="empty-wallet-logo"
          className="h-24 w-auto object-contain shrink-0"
        />
      </div>

      <h1 className="text-teal-mid text-[14px] font-bold leading-tight uppercase truncate z-10">
        {pocket.name} - {userName}
      </h1>
    </div>
  );
}

export function PocketCardSkeleton() {
  return (
    <div className="w-full rounded-xl p-5 flex flex-col justify-between gap-3 bg-grey100">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="size-6 rounded-md" />
      </div>

      <div className="w-full flex justify-between items-center">
        <Skeleton className="h-10 w-12 rounded-md" />
        <Skeleton className="size-24 rounded-xl" />
      </div>

      <Skeleton className="h-4 w-48" />
    </div>
  );
}
