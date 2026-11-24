import { SettingListsSkeleton } from "./SettingLists";

export default function SettingsLoading() {
  return (
    <main className="w-full flex flex-col bg-mist gap-6">
      <SettingListsSkeleton />
    </main>
  );
}
