import { requireSession } from "@/lib/auth";
import { getUserProfile } from "@/db/queries";
import { Suspense } from "react";
import ProfileCard, { ProfileCardSkeleton } from "./ProfileCard";
import SettingLists, { SettingListsSkeleton } from "./SettingLists";

async function ProfileCardSection() {
	const profile = await getUserProfile();

	return (
		<ProfileCard
			userName={profile.displayName}
			userEmail={profile.email}
			avatarUrl={profile.avatarUrl}
		/>
	);
}

async function SettingListSection() {
	await requireSession();
	return <SettingLists />;
}

export default function SettingsPage() {
	return (
		<main className="w-full flex flex-col bg-mist gap-6">
			<Suspense fallback={<ProfileCardSkeleton />}>
				<ProfileCardSection />
			</Suspense>

			<Suspense fallback={<SettingListsSkeleton />}>
				<SettingListSection />
			</Suspense>
		</main>
	);
}
