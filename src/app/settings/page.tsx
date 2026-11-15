import { requireSession } from "@/lib/auth";
import { Suspense } from "react";
import ProfileCard, { ProfileCardSkeleton }  from "./ProfileCard";
import SettingLists  from "./SettingLists";

async function ProfileCardSection() {
    const [session] = await Promise.all([requireSession()]);

    return (
        <ProfileCard userName={session.displayName}/>
    );
}

function SettingListSection() {
    return(
        <SettingLists />
    )
}

export default function SettingsPage() {
    return(
        <main className="w-full flex flex-col bg-mist gap-4">
            <Suspense fallback={<ProfileCardSkeleton/>}>
                <ProfileCardSection/>
            </Suspense>
        </main>
    );
}