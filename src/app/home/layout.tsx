import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/ui/header";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
	const session = await getSession();

	if(!session){
		redirect("/");
	}

	return (
		<div className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden">
		<Header user={session}/>
		<div className="flex-1 w-full! p-4">
			{children}
		</div>
		</div>
	);
}

