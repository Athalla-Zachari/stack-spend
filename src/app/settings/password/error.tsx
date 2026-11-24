"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPasswordError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="w-full flex flex-col bg-mist">
      <section
        role="alert"
        className="rounded-2xl bg-white shadow-lg border border-grey300/40 p-6 flex flex-col items-center text-center gap-3"
      >
        <span className="size-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
          <AlertCircle className="size-6" aria-hidden="true" />
        </span>
        <h2 className="text-base font-bold text-teal-deep">
          Could not load password settings
        </h2>
        <p className="text-sm text-subtext max-w-xs">
          Something went wrong while opening this page. Check your connection
          and try again.
        </p>
        <Button
          type="button"
          variant="solid"
          size="lg"
          onClick={() => reset()}
          className="mt-1 min-h-11 px-6 rounded-xl bg-teal hover:bg-teal-mid text-white font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          Try again
        </Button>
      </section>
    </main>
  );
}
