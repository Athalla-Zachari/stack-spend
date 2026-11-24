import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { getUserPockets, getUserProfile } from "@/db/queries";
import ProfileCard, { ProfileCardSkeleton } from "./ProfileCard";
import { PageHeaderSkeleton } from "@/components/ui/header";
import SettingsHeader from "./SettingsHeader";

async function ProfileCardSection() {
  const [profileResult, pocketsResult] = await Promise.allSettled([
    getUserProfile(),
    getUserPockets(),
  ]);

  if (profileResult.status === "rejected") {
    unstable_rethrow(profileResult.reason);
  }
  if (pocketsResult.status === "rejected") {
    unstable_rethrow(pocketsResult.reason);
  }

  if (profileResult.status === "rejected") {
    return (
      <section
        role="alert"
        className="bg-white rounded-2xl shadow-lg p-5 border border-grey300/40 flex items-center gap-3 text-sm text-subtext"
      >
        <AlertCircle className="size-5 shrink-0 text-error" aria-hidden="true" />
        <p>Profile summary is currently unavailable.</p>
      </section>
    );
  }

  const profile = profileResult.value;
  const activePocketCount =
    pocketsResult.status === "fulfilled" ? pocketsResult.value.length : null;

  return (
    <ProfileCard
      userName={profile.displayName}
      userEmail={profile.email}
      avatarUrl={profile.avatarUrl}
      activePocketCount={activePocketCount}
    />
  );
}

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh w-full flex flex-col font-sans overflow-x-hidden bg-mist">
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
