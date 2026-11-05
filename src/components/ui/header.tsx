import { SessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export default function Header({user}: {user: SessionUser}){
    return(
		<section className="flex items-center p-4 gap-2">
			<div className="flex flex-col flex-1">
			<h1 className="text-lg text-teal-deep font-semibold">StackSpend</h1>
			<p className="text-subtext text-sm">Wazzup, {user.displayName}</p>
			</div>

			<div>
			<Avatar size="lg">
			<AvatarImage
				src="https://github.com/shadcn.png"
				alt="@shadcn"
				className="grayscale"
			/>
			<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			</div>

			<Button
			variant={"icon"} 
			size={"icon"}
			>
				<Settings className="size-8! text-teal-deep"/>
			</Button>

		</section>
    )
}