import { Suspense } from "react";
import { getUserProfile } from "@/db/queries";
import ProfileEditor, { ProfileEditorSkeleton } from "./ProfileEditor";

async function ProfileEditorSection() {
  const profile = await getUserProfile();

  return (
    <ProfileEditor
      initialDisplayName={profile.displayName}
      initialAvatarUrl={profile.avatarUrl}
      email={profile.email}
    />
  );
}

export default function SettingsProfilePage() {
  return (
    <main className="w-full flex flex-col bg-mist">
      <Suspense fallback={<ProfileEditorSkeleton />}>
        <ProfileEditorSection />
      </Suspense>
    </main>
  );
}
