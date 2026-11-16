"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PeriodNavigatorProps {
  label: string;
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function PeriodNavigator({
  label,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
  className = "",
  children,
}: PeriodNavigatorProps) {
  return (
    <div
      className={`flex justify-between items-center border border-charcoal text-charcoal font-semibold rounded-full px-2 py-1 ${className}`}
    >
      <Button
        type="button"
        variant="icon"
        size="icon"
        onClick={onPrev}
        disabled={prevDisabled}
        aria-label={prevLabel}
        className="min-h-11 min-w-11 cursor-pointer hover:bg-grey100 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </Button>

      <div className="relative flex items-center justify-center min-h-11 min-w-0 rounded-full [&:has(:focus-visible)]:outline-2 [&:has(:focus-visible)]:outline-teal-deep">
        <span className="pointer-events-none min-h-11 flex items-center gap-1 w-fit text-[16px] text-charcoal font-semibold px-3 py-1 truncate">
          <span className="truncate">{label}</span>
          <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
        </span>
        {children}
      </div>

      <Button
        type="button"
        variant="icon"
        size="icon"
        onClick={onNext}
        disabled={nextDisabled}
        aria-label={nextLabel}
        className="min-h-11 min-w-11 cursor-pointer hover:bg-grey100 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
