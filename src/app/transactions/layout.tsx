import { Suspense } from "react";
import { PageHeader } from "@/components/ui/header";
import { Skeleton } from "@/components/ui/skeleton";

function PageHeaderSkeleton() {
    return (
        <section className="flex items-center p-4 gap-3">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-5 w-28" />
        </section>
    );
}

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden bg-aqua-light">
            <Suspense fallback={<PageHeaderSkeleton />}>
                <PageHeader />
            </Suspense>
            <div className="flex-1 w-full flex flex-col">
                {children}
            </div>
        </div>
    );
}
