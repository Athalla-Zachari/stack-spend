"use client";

import type { SessionUser } from "@/lib/auth";
import { getInitials } from "@/lib/profile";
import { ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";

export default function Header({
  user,
}: {
  user: SessionUser & { avatarUrl?: string | null };
}) {
  const router = useRouter();
  const initials = getInitials(user.displayName);

  return (
    <section className="flex items-center p-4 gap-2">
      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="text-2xl text-teal-deep font-bold leading-tight tracking-tighter">
          StackSpend
        </h1>
        <p className="text-subtext text-sm leading-tight truncate">
          Wazzup, {user.displayName}
        </p>
      </div>

      <Avatar size="lg">
        {user.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={user.displayName} />
        )}
        <AvatarFallback className="bg-teal/15 text-teal-deep font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <Button
        variant="icon"
        size="icon"
        aria-label="Open settings"
        className="min-h-11 min-w-11 cursor-pointer"
        onClick={() => router.push("/settings")}
      >
        <Settings className="size-7! text-teal-deep" aria-hidden="true" />
      </Button>
    </section>
  );
}

export function PageHeader({
  title,
  backHref = "/home",
}: {
  title?: string;
  backHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  const displayTitle =
    title ?? (segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "");

  return (
    <section className="flex items-center p-4">
      <Button
        onClick={() => router.push(backHref)}
        variant="icon"
        size="xxs"
        className="min-h-11 pr-2 cursor-pointer"
        aria-label={`Back to ${backHref === "/settings" ? "Settings" : "Home"}`}
      >
        <span className="flex items-center gap-3 text-teal-deep text-[16px] font-medium">
          <ChevronLeft className="size-6!" aria-hidden="true" />
          <p>{displayTitle}</p>
        </span>
      </Button>
    </section>
  );
}
