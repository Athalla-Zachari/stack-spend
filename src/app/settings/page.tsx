import { requireSession } from "@/lib/auth";
import { Suspense } from "react";
import SettingLists, { SettingListsSkeleton } from "./SettingLists";

async function SettingListSection() {
  await requireSession();
  return <SettingLists />;
}

export default function SettingsPage() {
  return (
    <main className="w-full flex flex-col bg-mist gap-6">
      <Suspense fallback={<SettingListsSkeleton />}>
        <SettingListSection />
      </Suspense>
    </main>
  );
}
