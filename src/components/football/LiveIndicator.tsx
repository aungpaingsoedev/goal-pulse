import { cn } from "@/lib/utils";

export interface LiveIndicatorProps {
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export function LiveIndicator({
  className,
  label = "LIVE",
  showLabel = true,
}: LiveIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-live",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-live animate-live-pulse" />
        <span className="relative h-2 w-2 rounded-full bg-live" />
      </span>
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
    </span>
  );
}
