import { Badge } from "@/components/ui/badge";
import { LiveIndicator } from "@/components/football/LiveIndicator";
import { cn } from "@/lib/utils";
import {
  FINISHED_STATUSES,
  LIVE_STATUSES,
  type FixtureStatus,
} from "@/types/football";

export interface MatchStatusProps {
  status: FixtureStatus;
  elapsed?: number | null;
  kickoff?: string | null;
  className?: string;
}

function formatKickoff(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MatchStatus({
  status,
  elapsed,
  kickoff,
  className,
}: MatchStatusProps) {
  const isLive = LIVE_STATUSES.includes(status);
  const isFinished = FINISHED_STATUSES.includes(status);

  if (isLive) {
    const clock =
      status === "HT"
        ? "HT"
        : elapsed != null
          ? `${elapsed}'`
          : status === "LIVE"
            ? "LIVE"
            : status;

    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <LiveIndicator />
        <span className="font-mono text-xs font-semibold text-live">{clock}</span>
      </div>
    );
  }

  if (isFinished) {
    return (
      <Badge variant="muted" className={cn("font-mono", className)}>
        {status}
      </Badge>
    );
  }

  if (status === "NS" || status === "TBD") {
    return (
      <span
        className={cn(
          "font-mono text-xs font-medium text-muted-foreground",
          className,
        )}
      >
        {formatKickoff(kickoff) ?? status}
      </span>
    );
  }

  return (
    <Badge variant="outline" className={cn("font-mono", className)}>
      {status}
    </Badge>
  );
}
