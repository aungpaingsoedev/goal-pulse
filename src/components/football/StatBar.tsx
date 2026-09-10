import { cn } from "@/lib/utils";

export interface StatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
  homeLabel?: string;
  awayLabel?: string;
  invert?: boolean;
  className?: string;
}

function toPercent(home: number, away: number) {
  const total = home + away;
  if (total <= 0) return { home: 50, away: 50 };
  return {
    home: (home / total) * 100,
    away: (away / total) * 100,
  };
}

export function StatBar({
  label,
  homeValue,
  awayValue,
  invert = false,
  className,
}: StatBarProps) {
  const pct = toPercent(homeValue, awayValue);
  const homeLeads = invert ? homeValue < awayValue : homeValue > awayValue;
  const awayLeads = invert ? awayValue < homeValue : awayValue > homeValue;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span
          className={cn(
            "font-mono tabular-nums",
            homeLeads ? "font-semibold text-foreground" : "text-muted-foreground",
          )}
        >
          {homeValue}
        </span>
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-mono tabular-nums",
            awayLeads ? "font-semibold text-foreground" : "text-muted-foreground",
          )}
        >
          {awayValue}
        </span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full transition-all",
            homeLeads ? "bg-primary" : "bg-primary/40",
          )}
          style={{ width: `${pct.home}%` }}
        />
        <div
          className={cn(
            "h-full transition-all",
            awayLeads ? "bg-foreground/70" : "bg-foreground/30",
          )}
          style={{ width: `${pct.away}%` }}
        />
      </div>
    </div>
  );
}
