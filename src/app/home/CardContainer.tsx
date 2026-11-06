"use client";

import type { Pocket } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { CircleDollarSign, CreditCardReader } from "lucide-react";
import Cards from "./cards";

interface CardContainerProps {
  pockets: Pocket[];
  userName: string;
}

export default function CardContainer({
  pockets,
  userName,
}: CardContainerProps) {
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
                IDR {totalBalance.toLocaleString("id-ID")}
                </h1>
            </span>
            <p className="text-subtext text-sm leading-tight">Total Balance</p>
            </div>

            <div className="flex items-center gap-2">
            <Button
            variant={"icon"}
            size={"icon"}
            className={"bg-teal-mid p-2 h-max w-max text-aqua-light"}
            >
                <CircleDollarSign className="size-5!" />
            </Button>
            <Button
            variant={"icon"}
            size={"icon"}
            className={"bg-teal-mid p-2.5 h-max w-max text-aqua-light"}
            >
                <CreditCardReader className="size-4!" />
            </Button>
            </div>
        </div>

        <Cards pockets={pockets} userName={userName} />
        </section>
    );
}
