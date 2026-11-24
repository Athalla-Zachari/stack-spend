import { Suspense } from "react";
import { getUserPockets, getUserProfile } from "@/db/queries";
import ProfileCard, { ProfileCardSkeleton } from "./ProfileCard";
import { PageHeaderSkeleton } from "@/components/ui/header";
import SettingsHeader from "./SettingsHeader";

async function ProfileCardSection() {
  const [profile, activePockets] = await Promise.all([
    getUserProfile(),
    getUserPockets(),
  ]);

  return (
    <ProfileCard
      userName={profile.displayName}
      userEmail={profile.email}
      avatarUrl={profile.avatarUrl}
      activePocketCount={activePockets.length}
    />
  );
}

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
      <div className="flex-1 flex flex-col w-full p-4 gap-6">
        <Suspense fallback={<ProfileCardSkeleton />}>
          <ProfileCardSection />
        </Suspense>
        {children}
      </div>
    </div>
  );
}
