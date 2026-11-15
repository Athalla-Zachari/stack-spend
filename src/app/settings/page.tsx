import { requireSession } from "@/lib/auth";
import { Suspense } from "react";
import ProfileCard, { ProfileCardSkeleton } from "./ProfileCard";
import SettingLists, { SettingListsSkeleton } from "./SettingLists";

async function ProfileCardSection() {
	const session = await requireSession();

	return (
		<ProfileCard
			userName={session.displayName}
			userEmail={session.email}
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
