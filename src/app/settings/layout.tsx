import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SettingsHeader from "./SettingsHeader";

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
                <SettingsHeader />
            </Suspense>
            <div className="flex-1 w-full p-4">
                {children}
            </div>
        </div>
    );
}