import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, pockets } from "@/db";

import CardContainer from "./CardContainer";

export default async function HomePage() {
	const session = await getSession();

	if (!session) {
		redirect("/");
	}

	const userPockets = await db
		.select()
		.from(pockets)
		.where(eq(pockets.userId, session.id));

	return (
		<main className="w-full flex flex-col bg-beige">
			<CardContainer pockets={userPockets} userName={session.displayName} />
		</main>
	);
}
