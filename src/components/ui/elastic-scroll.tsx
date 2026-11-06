"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  animate,
  type MotionValue,
} from "motion/react";
import { cn } from "cn";

interface ElasticScrollContextValue {
  x: MotionValue<number>;
  y: MotionValue<number>;
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  transformOrigin: MotionValue<string>;
}

const ElasticScrollContext =
  React.createContext<ElasticScrollContextValue | null>(null);

export interface ElasticScrollProps
  extends React.HTMLAttributes<HTMLElement> {
  direction?: "horizontal" | "vertical";
  fullBleed?: boolean;
  snap?: boolean;
  maxDisplacement?: number;
  maxScale?: number;
}

export function ElasticScroll({
  children,
  className,
  direction = "horizontal",
  fullBleed = false,
  snap = true,
  maxDisplacement = 42,
  maxScale = 0.08,
  ...props
}: ElasticScrollProps) {
  const scrollRef = React.useRef<HTMLElement>(null);
  const touchStartPos = React.useRef(0);
  const wheelTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const transformOrigin = useMotionValue("center center");

  const isHorizontal = direction === "horizontal";

  const springBack = React.useCallback(() => {
    animate(x, 0, { type: "spring", stiffness: 420, damping: 28 });
    animate(y, 0, { type: "spring", stiffness: 420, damping: 28 });
    animate(scaleX, 1, { type: "spring", stiffness: 420, damping: 28 });
    animate(scaleY, 1, { type: "spring", stiffness: 420, damping: 28 });
  }, [x, y, scaleX, scaleY]);

  const applyStretch = React.useCallback(
    (pull: number, side: "start" | "end") => {
      const damped = Math.tanh(pull / 140) * maxDisplacement;
      const scale = 1 + Math.min(Math.abs(damped) * 0.002, maxScale);

      if (isHorizontal) {
        transformOrigin.set(
          side === "start" ? "left center" : "right center"
        );
        x.set(damped);
        scaleX.set(scale);
      } else {
        transformOrigin.set(
          side === "start" ? "center top" : "center bottom"
        );
        y.set(damped);
        scaleY.set(scale);
      }
    },
    [isHorizontal, maxDisplacement, maxScale, transformOrigin, x, y, scaleX, scaleY]
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartPos.current = isHorizontal
      ? e.touches[0].clientX
      : e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const el = scrollRef.current;
    if (!el) return;

    const currentPos = isHorizontal
      ? e.touches[0].clientX
      : e.touches[0].clientY;
    const diff = currentPos - touchStartPos.current;

    const atStart = isHorizontal ? el.scrollLeft <= 1 : el.scrollTop <= 1;
    const atEnd = isHorizontal
      ? el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
      : el.scrollTop >= el.scrollHeight - el.clientHeight - 1;

    if (atStart && diff > 0) {
      applyStretch(diff, "start");
    } else if (atEnd && diff < 0) {
      applyStretch(diff, "end");
    } else if (x.get() !== 0 || y.get() !== 0) {
      x.set(0);
      y.set(0);
      scaleX.set(1);
      scaleY.set(1);
    }
  };

  const handleTouchEnd = () => {
    if (
      x.get() !== 0 ||
      y.get() !== 0 ||
      scaleX.get() !== 1 ||
      scaleY.get() !== 1
    ) {
      springBack();
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
    const el = scrollRef.current;
    if (!el) return;

    const delta = isHorizontal
      ? Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : 0
      : e.deltaY;

    if (delta === 0) return;

    const atStart = isHorizontal ? el.scrollLeft <= 1 : el.scrollTop <= 1;
    const atEnd = isHorizontal
      ? el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
      : el.scrollTop >= el.scrollHeight - el.clientHeight - 1;

    const currentOffset = isHorizontal ? x.get() : y.get();

    if (atStart && delta < 0) {
      applyStretch(currentOffset * 2.5 - delta, "start");
    } else if (atEnd && delta > 0) {
      applyStretch(currentOffset * 2.5 - delta, "end");
    } else {
      return;
    }

    if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    wheelTimeout.current = setTimeout(() => {
      springBack();
    }, 120);
  };

  const contextValue = React.useMemo(
    () => ({ x, y, scaleX, scaleY, transformOrigin }),
    [x, y, scaleX, scaleY, transformOrigin]
  );

  return (
    <ElasticScrollContext.Provider value={contextValue}>
      <section
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        className={cn(
          "flex scrollbar-none [&::-webkit-scrollbar]:hidden",
          isHorizontal ? "items-center overflow-x-auto" : "flex-col overflow-y-auto",
          fullBleed && isHorizontal ? "-mx-8 px-8 w-[calc(100%+4rem)]" : "w-full",
          snap && (isHorizontal ? "snap-x snap-mandatory" : "snap-y snap-mandatory"),
          className
        )}
        {...props}
      >
        {children}
      </section>
    </ElasticScrollContext.Provider>
  );
}

export type ElasticScrollItemProps = React.ComponentProps<typeof motion.div>;

export function ElasticScrollItem({
  children,
  className,
  style,
  ...props
}: ElasticScrollItemProps) {
  const context = React.useContext(ElasticScrollContext);

  return (
    <motion.div
      style={
        context
          ? {
              x: context.x,
              y: context.y,
              scaleX: context.scaleX,
              scaleY: context.scaleY,
              transformOrigin: context.transformOrigin,
              ...style,
            }
          : style
      }
      className={cn("shrink-0 snap-center will-change-transform", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

