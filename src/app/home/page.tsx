import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, pockets } from "@/db";

import CardContainer, { CardContainerSkeleton } from "./CardContainer";

async function PocketsContent() {
	const session = await getSession();

	if (!session) {
		redirect("/");
	}

	const userPockets = await db
		.select()
		.from(pockets)
		.where(eq(pockets.userId, session.id));

	return <CardContainer pockets={userPockets} userName={session.displayName} />;
}

export default function HomePage() {
	return (
		<main className="w-full flex flex-col bg-beige">
			<Suspense fallback={<CardContainerSkeleton />}>
				<PocketsContent />
			</Suspense>
		</main>
	);
}
