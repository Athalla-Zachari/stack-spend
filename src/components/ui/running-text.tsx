"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type TextTag = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface RunningTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TextTag;
  children: React.ReactNode;
  /** Kecepatan gerak dalam pixel per detik (default: 32) */
  speed?: number;
  /** Jeda diam sebelum mulai berjalan kembali dalam detik (default: 1.4) */
  pauseDuration?: number;
  /** Jarak antar teks duplikat saat looping dalam pixel (default: 28) */
  gap?: number;
}

export function RunningText({
  as: Component = "div",
  children,
  className,
  speed = 32,
  pauseDuration = 1.4,
  gap = 28,
  ...props
}: RunningTextProps) {
  const containerRef = React.useRef<HTMLElement | null>(null);
  const measureRef = React.useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const [overflowState, setOverflowState] = React.useState({
    isOverflowing: false,
    textWidth: 0,
  });

  React.useEffect(() => {
    const containerEl = containerRef.current;
    const measureEl = measureRef.current;
    if (!containerEl || !measureEl) return;

    const updateOverflow = () => {
      const textWidth = measureEl.offsetWidth;
      const containerWidth = containerEl.clientWidth;
      const isOverflowing = textWidth > containerWidth + 1;

      setOverflowState((prev) =>
        prev.isOverflowing === isOverflowing && prev.textWidth === textWidth
          ? prev
          : { isOverflowing, textWidth }
      );
    };

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(containerEl);
    observer.observe(measureEl);

    return () => observer.disconnect();
  }, [children]);

  const shouldAnimate =
    overflowState.isOverflowing && !prefersReducedMotion && overflowState.textWidth > 0;
  const travelDistance = overflowState.textWidth + gap;
  const duration = Math.max(travelDistance / speed, 2.5);

  return (
    <Component
      ref={containerRef as React.Ref< never >}
      className={cn(
        "relative block w-full min-w-0 overflow-hidden",
        shouldAnimate &&
          "mask-[linear-gradient(to_right,black_calc(100%-12px),transparent)]",
        className
      )}
      {...props}
    >
      {/* Elemen ukur tersembunyi agar kalkulasi lebar teks asli selalu akurat saat resize */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap"
      >
        {children}
      </span>

      {shouldAnimate ? (
        <motion.span
          key={travelDistance}
          className="inline-flex w-max whitespace-nowrap will-change-transform"
          initial={{ x: 0 }}
          animate={{ x: [0, -travelDistance] }}
          transition={{
            duration,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: pauseDuration,
          }}
        >
          <span style={{ paddingRight: `${gap}px` }}>{children}</span>
          <span aria-hidden="true" style={{ paddingRight: `${gap}px` }}>
            {children}
          </span>
        </motion.span>
      ) : (
        <span className="block truncate">{children}</span>
      )}
    </Component>
  );
}
