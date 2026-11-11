import { Suspense } from "react";
import { PageHeader } from "@/components/ui/header";
import { Skeleton } from "@/components/ui/skeleton";
import { DebtsCardTotal } from "./DebtsCardTotal";

function PageHeaderSkeleton() {
	return (
		<section className="flex items-center p-4 gap-3">
			<Skeleton className="size-6 rounded-md" />
			<Skeleton className="h-5 w-28" />
		</section>
	);
}

async function DebtsCardSection() {


	return <DebtsCardTotal/>
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
				<Suspense>
					<DebtsCardSection/>
				</Suspense>
			</section>
			<div className="flex-1 w-full flex flex-col">
				{children}
			</div>
		</div>
	);
}
