"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { CircleCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileCardProps {
    userName: string;
}

export default function ProfileCard({
    userName
}: ProfileCardProps) {
    

    return(
        <section className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-3">
            <div>
                <Avatar size="lg">
                <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                    className="grayscale"
                    />
                <AvatarFallback>AZ</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col">
                <span className="text-subtext text-md font-semibold leading-tight">
                {userName}
                </span>
                <span className="text-sm text-grey500">alkebabshiey@gmail.com</span>
                <div className="px-2 py-0.5 my-1.5 bg-teal rounded-full w-fit text-grey100 text-[8px] flex items-center gap-1">
                    <CircleCheck size={9}/> Certified Daddy 
                </div>
            </div>
            </div>
        </section>
    );
}

export function ProfileCardSkeleton() {
    return(
        <section className="py2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md bg-grey-300/30"/>
            <Skeleton className="h-4 w-12 rounded-md bg-grey-300/30"/>
            </div>
        </section>
    );
}