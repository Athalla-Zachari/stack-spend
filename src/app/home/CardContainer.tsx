"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Pocket } from "@/db/schema";
import { menuList } from "./menu";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    CreditCardPlus,
    ArrowLeftRight,  
    Eye,
    EyeOff 
} from "lucide-react";
import Cards from "./Card";

interface CardContainerProps {
  pockets: Pocket[];
  userName: string;
}


export default function CardContainer({
  pockets,
  userName,
}: CardContainerProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const totalBalance = pockets.reduce(
        (sum, pocket) => sum + Number(pocket.balance || 0),
        0,
    );

    return (
        <section className="rounded-lg shadow-lg p-4 bg-white flex flex-col">
        <div className="flex items-center py-3">
            <div className="flex flex-col flex-1">
            <span className="flex items-center">
                <h1 className="text-teal-mid text-lg font-bold leading-tight">
                    IDR {isVisible ? `${totalBalance.toLocaleString("id-ID")}, 00` : ("* * * * * * * *")}
                </h1>
                <Button
                onClick={() => setIsVisible((prev) => !prev)} 
                variant={"icon"} 
                size={'icon'}
                className={"text-teal-mid"}
                >
                    {isVisible ? (
					<EyeOff />
					) : (
					<Eye  />
					)}
                </Button>
            </span>
            <p className="text-subtext text-sm leading-tight">Total Balance</p>
            </div>

            <div className="flex items-center gap-2">
            <Button
            onClick={() => router.push("/transactions")}
            variant={"icon"}
            className={"bg-teal-mid p-2 h-max w-max text-aqua-light"}
            >
                <CreditCardPlus className="size-7!" />
            </Button>
            <Button
            onClick={() => router.push("/transactions/transfer")}
            variant={"icon"}
            className={"bg-teal-mid p-2.5 h-max w-max text-aqua-light"}
            >
                <ArrowLeftRight className="size-6!" />
            </Button>
            </div>
        </div>

        <Cards pockets={pockets} userName={userName} />

        {/* Menu List */}
        <section className="flex items-center gap-5 py-3">
        {menuList.map((item) => {
            const Icon = item.icon;

            return(
            <div key={item.id} className="flex flex-col gap-1 items-center">
                <Button
                onClick={() => router.push(`${item.path}`)}
                variant={"icon"}
                size={"sm"}
                className={"bg-teal-mid p-2 h-max w-max rounded-full text-aqua-light"}
                >   
                    <Icon className="size-7!" />
                </Button>
                <p className="text-xs text-grey500">{item.label}</p>
            </div>
            );
        })}
        </section>

        
        </section>
    );
}

export function CardContainerSkeleton() {
    return (
        <section className="rounded-lg shadow-lg p-4 bg-white flex flex-col">
            {/* Top Bar: Total Balance & Action Buttons */}
            <div className="flex items-center py-3">
                <div className="flex flex-col flex-1 gap-1.5">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-3.5 w-24" />
                </div>

                <div className="flex items-center gap-2">
                    <Skeleton className="size-9 rounded-lg" />
                    <Skeleton className="size-9 rounded-lg" />
                </div>
            </div>

            {/* Middle: Pocket Card Skeleton */}
            <div className="py-3">
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
            </div>

            {/* Bottom: Inside Navigation Skeleton */}
            <section className="flex items-center gap-3 py-3">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="flex flex-col items-center gap-1.5">
                        <Skeleton className="size-11 rounded-lg" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                ))}
            </section>
        </section>
    );
}
