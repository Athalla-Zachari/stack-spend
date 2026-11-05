import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CircleDollarSign, CreditCardReader } from "lucide-react";

export default async function HomePage() {
	const session = await getSession();

	if (!session) {
		redirect("/");
	}

	return (
		<main className="w-full flex flex-col">
			<section className="rounded-lg shadow-lg bg-white flex flex-col">
			<div className="flex items-center px-4 py-3">

				<div className="flex flex-col flex-1">
				<h1 className="text-teal-mid text-lg font-bold">IDR 2.781.000</h1>
				<p className="text-subtext text-sm">Total Balance</p>
				</div>

				<div className="flex items-center gap-2">
					<Button 
					variant={"icon"}
					size={"icon"}
					className={"bg-teal-mid p-2 h-max w-max text-aqua-light"}
					>
						<CircleDollarSign className="size-5!"/>
					</Button>
					<Button 
					variant={"icon"}
					size={"icon"}
					className={"bg-teal-mid p-2.5 h-max w-max text-aqua-light"}
					>
						<CreditCardReader className="size-4!"/>
					</Button>
				</div>
			</div>
			</section>
		</main>
	);
}
