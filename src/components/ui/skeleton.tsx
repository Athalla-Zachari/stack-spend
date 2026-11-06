import { cn } from "cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-lg bg-grey300/70", className)}
      {...props}
    />
  );
}

export { Skeleton };

