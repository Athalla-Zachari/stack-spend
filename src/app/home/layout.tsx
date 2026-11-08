import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import Header from "@/components/ui/header";
import { Skeleton } from "@/components/ui/skeleton";

async function AuthenticatedHeader() {
	const session = await requireSession();
	return <Header user={session} />;
}

function HeaderSkeleton() {
	return (
		<section className="flex items-center p-4 gap-2">
			<div className="flex flex-col flex-1 gap-1.5">
				<Skeleton className="h-5 w-28" />
				<Skeleton className="h-3.5 w-36" />
			</div>
			<Skeleton className="size-10 rounded-full" />
			<Skeleton className="size-8 rounded-lg" />
		</section>
	);
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden bg-mist">
			<Suspense fallback={<HeaderSkeleton />}>
				<AuthenticatedHeader />
			</Suspense>
			<div className="flex-1 w-full! p-4">
				{children}
			</div>
		</div>
	);
}
