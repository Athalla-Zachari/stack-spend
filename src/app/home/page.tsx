"use client"

import { useState } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, pockets } from "@/db";

import { Button } from "@/components/ui/button";
import { CircleDollarSign, CreditCardReader } from "lucide-react";
import Cards from "./cards";

export default async function HomePage() {
	const [isVisible, setIsVisible] = useState();
	const session = await getSession();

	if (!session) {
		redirect("/");
	}

	const userPockets = await db
		.select()
		.from(pockets)
		.where(eq(pockets.userId, session.id));

	const totalBalance = userPockets.reduce(
		(sum, pocket) => sum + Number(pocket.balance || 0),
		0
	);

	return (
		<main className="w-full flex flex-col bg-beige">
			{/* Card Container */}
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

				<Cards pockets={userPockets} userName={session.displayName} />
			
			</section>
		</main>
	);
}
