import { Suspense } from "react";
import { PageHeader, PageHeaderSkeleton } from "@/components/ui/header";

export default function DailySpendingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden bg-mist">
			<Suspense fallback={<PageHeaderSkeleton />}>
				<PageHeader title="Daily Spending" />
			</Suspense>
			<div className="flex-1 w-full flex flex-col">
				{children}
			</div>
		</div>
	);
}
