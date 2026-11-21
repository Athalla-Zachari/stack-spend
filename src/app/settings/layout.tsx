import { Suspense } from "react";
import { PageHeaderSkeleton } from "@/components/ui/header";
import SettingsHeader from "./SettingsHeader";

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden bg-mist">
      <Suspense fallback={<PageHeaderSkeleton />}>
        <SettingsHeader />
      </Suspense>
      <div className="flex-1 w-full p-4">{children}</div>
    </div>
  );
}
