"use client"

import type { SessionUser } from "@/lib/auth";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useRouter } from "next/navigation";

export default function Header({user}: {user: SessionUser}){
    return(
		<section className="flex items-center p-4 gap-2">
			<div className="flex flex-col flex-1">
			<h1 className="text-lg text-teal-deep font-semibold leading-tight tracking-tighter">StackSpend</h1>
			<p className="text-subtext text-sm leading-tight">Wazzup, {user.displayName}</p>
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
				<Settings className="size-7! text-teal-deep"/>
			</Button>

		</section>
    )
}

export function PageHeader({
	title
}: {
	title: string
}){
	const router = useRouter();

	return(
		<section className="flex items-center p-4">
            <Button
			onClick={() => router.back()}
            variant={"icon"}
            size={"xxs"}
            >   
                <span className="flex items-center gap-3 text-teal-deep text-[16px] font-medium">
                <ChevronLeft className="size-6!"/>
                <p>{title}</p>
                </span>
            </Button>
        </section>
	);
}