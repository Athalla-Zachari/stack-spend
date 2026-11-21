import { Suspense } from "react";
import { PageHeader, PageHeaderSkeleton } from "@/components/ui/header";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserDebts } from "@/db/queries";
import { DebtsCardTotal } from "./DebtsCardTotal";

function DebtsCardSkeleton() {
	return <Skeleton className="w-full h-36 rounded-xl bg-teal/20" />;
}

async function DebtsCardSection() {
	const debts = await getUserDebts();
	return <DebtsCardTotal debts={debts} />;
}

export default function DebtsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen w-full flex flex-col gap-6 font-sans overflow-x-hidden bg-aqua-light">
			<Suspense fallback={<PageHeaderSkeleton />}>
				<PageHeader title="Debts" />
			</Suspense>
			<section className="w-full px-6">
				<Suspense fallback={<DebtsCardSkeleton />}>
					<DebtsCardSection />
				</Suspense>
			</section>
			<div className="flex-1 w-full flex flex-col">
				{children}
			</div>
		</div>
	);
}
