"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/ui/header";

const SETTINGS_ROUTE_TITLES: Record<string, string> = {
  "/settings": "Setting",
  "/settings/profile": "Profile",
};

export default function SettingsHeader() {
  const pathname = usePathname();
  const isChildRoute = pathname !== "/settings";

  return (
    <PageHeader
      title={SETTINGS_ROUTE_TITLES[pathname]}
      backHref={isChildRoute ? "/settings" : "/home"}
    />
  );
}
