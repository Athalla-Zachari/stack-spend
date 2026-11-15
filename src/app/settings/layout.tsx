import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/header";
import { Skeleton } from "@/components/ui/skeleton";

function PageHeaderSkeleton() {
    return(
        <section className="flex items-center p-4 gap-3">
            <Skeleton className="size-6 rounded-md"/>
            <Skeleton className="h-5 w-28"/>
        </section>
    );
}

export default function SettingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return(
        <div className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden bg-mist">
            <Suspense fallback={<PageHeaderSkeleton/>}>
                <PageHeader title="Setting"/>
            </Suspense>
            <div className="flex-1 w-full p-4">
                {children}
            </div>
        </div>
    );
}