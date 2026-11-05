import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

import { Settings } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";

export default async function HomePage() {
	const session = await getSession();

	if (!session) {
		redirect("/");
	}

	return (
		<main className="w-full flex flex-col">

		</main>
	);
}
