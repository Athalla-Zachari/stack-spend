"use client";

import { useState } from "react";
import Image from "next/image";
import type { Pocket } from "@/db/schema";

import { Button } from "@/components/ui/button";
import {
  ElasticScroll,
  ElasticScrollItem,
} from "@/components/ui/elastic-scroll";
import { Eye, EyeOff } from "lucide-react";
import walletLogo from "../../../public/assets/empty-wallet.svg";
import chip from "../../../public/assets/Circuit.svg";

interface CardsProps {
  pockets: Pocket[];
  userName: string;
}

const CARD_BG_COLORS = [
  "bg-lime",
  "bg-aqua-light",
  "bg-violet",
  "bg-pink",
] as const;

function getCardBgColor(id: string, index: number) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CARD_BG_COLORS[(Math.abs(hash) + index) % CARD_BG_COLORS.length];
}

export default function Cards({ pockets, userName }: CardsProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <ElasticScroll fullBleed className="gap-4 py-3">
        {pockets.map((pocket, index) => {
            const bgColor = getCardBgColor(pockets[0]?.id || pocket.id, index);

            return (
            /* the card itself */
            <ElasticScrollItem
            key={pocket.id}
            className={`relative w-full rounded-xl shadow-lg p-5 flex flex-col justify-between gap-3 ${bgColor} overflow-hidden`}
            >
            <span className="flex items-center">
                <h1 className="text-teal-deep text-lg font-bold leading-tight truncate z-10">
                    IDR {isVisible ? `${Number(pocket.balance || 0).toLocaleString("id-ID")}, 00` : ("* * * * * * * *")}
                </h1>
                <Button
                onClick={() => setIsVisible((prev) => !prev)} 
                variant={"icon"} 
                size={'icon'}
                className={"text-teal-deep"}
                >
                    {isVisible ? (
					<EyeOff />
					) : (
					<Eye  />
					)}
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
            </ElasticScrollItem>
            );
        })}
        </ElasticScroll>
    );
}
