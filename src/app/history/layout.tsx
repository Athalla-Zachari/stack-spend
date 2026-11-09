import { Suspense } from "react";
import { PageHeader } from "@/components/ui/header";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSelector } from "./CardSelector";
import { PocketCardSkeleton } from "@/components/PocketCard";
import { requireSession } from "@/lib/auth";
import { getUserPockets } from "@/db/queries";

function PageHeaderSkeleton() {
  return (
    <section className="flex items-center p-4 gap-3">
      <Skeleton className="size-6 rounded-md" />
      <Skeleton className="h-5 w-28" />
    </section>
  );
}

export default async function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, pockets] = await Promise.all([
    requireSession(),
    getUserPockets(),
  ]);

  return (
    <div className="min-h-screen w-full flex flex-col gap-10 font-sans overflow-x-hidden bg-aqua-light">
      <Suspense fallback={<PageHeaderSkeleton />}>
        <PageHeader title="History" />
      </Suspense>
      <section className="w-full px-6">
        <Suspense fallback={<PocketCardSkeleton />}>
          <CardSelector pockets={pockets} userName={session.displayName} />
        </Suspense>
      </section>
      <div className="flex-1 w-full flex flex-col bg-white rounded-tl-4xl rounded-tr-4xl px-7 py-6 pt-8">
        {children}
      </div>
    </div>
  );
}
