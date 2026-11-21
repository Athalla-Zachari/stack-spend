import { Suspense } from "react";
import { PageHeader, PageHeaderSkeleton } from "@/components/ui/header";

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
      <div className="flex-1 w-full flex flex-col">{children}</div>
    </div>
  );
}
