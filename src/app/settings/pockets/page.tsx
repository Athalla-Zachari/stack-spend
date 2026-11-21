import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { getUserPockets } from "@/db/queries";
import PocketsManager, { PocketsManagerSkeleton } from "./PocketsManager";

async function PocketsSection() {
  const [session, userPockets] = await Promise.all([
    requireSession(),
    getUserPockets(),
  ]);

  return (
    <PocketsManager pockets={userPockets} userName={session.displayName} />
  );
}

export default function SettingsPocketsPage() {
	return (
		<main className="w-full flex flex-col bg-mist">
		<Suspense fallback={<PocketsManagerSkeleton />}>
			<PocketsSection />
		</Suspense>
		</main>
	);
}
