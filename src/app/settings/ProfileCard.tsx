"use client";

import { CircleCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/profile";

interface ProfileCardProps {
  userName: string;
  userEmail?: string;
  avatarUrl?: string | null;
}

export default function ProfileCard({
  userName,
  userEmail,
  avatarUrl,
}: ProfileCardProps) {
  const initials = getInitials(userName);

  return (
    <section
      aria-label="Profile Summary"
      className="bg-white rounded-2xl shadow-lg p-5 border border-grey300/40"
    >
      <div className="flex items-center gap-5 min-w-0">
        <Avatar className="shrink-0 size-16">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback className="bg-teal/15 text-teal-deep text-lg font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0 flex-1">
          <h1 className="text-teal-deep text-base font-bold leading-tight truncate">
            {userName}
          </h1>
          {userEmail && (
            <p className="text-sm text-subtext leading-snug truncate">
              {userEmail}
            </p>
          )}
          <div className="px-2.5 py-0.5 mt-1.5 bg-teal rounded-full w-fit text-white text-xs font-medium inline-flex items-center gap-1">
            <CircleCheck className="size-3 shrink-0" aria-hidden="true" />
            <span>Certified Daddy</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfileCardSkeleton() {
  return (
    <section
      aria-label="Loading profile"
      className="bg-white rounded-2xl shadow-lg p-5 border border-grey300/40"
    >
      <div className="flex items-center gap-3.5">
        <Skeleton className="size-16 shrink-0 rounded-full bg-grey300/40" />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <Skeleton className="h-4 w-32 rounded-md bg-grey300/40" />
          <Skeleton className="h-3.5 w-44 rounded-md bg-grey300/40" />
          <Skeleton className="h-5 w-24 rounded-full bg-grey300/40 mt-0.5" />
        </div>
      </div>
    </section>
  );
}
