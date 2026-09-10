import { EventItem } from "@/components/football/EventItem";
import { cn } from "@/lib/utils";
import type { MatchEvent } from "@/types/football";

export interface EventTimelineProps {
  events: MatchEvent[];
  homeTeamId?: number;
  className?: string;
}

export function EventTimeline({
  events,
  homeTeamId,
  className,
}: EventTimelineProps) {
  if (!events.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No events yet.
      </p>
    );
  }

  const sorted = [...events].sort((a, b) => {
    const aMin = a.time.elapsed + (a.time.extra ?? 0) / 100;
    const bMin = b.time.elapsed + (b.time.extra ?? 0) / 100;
    return aMin - bMin;
  });

  return (
    <ol className={cn("space-y-3", className)}>
      {sorted.map((event) => {
        const align =
          homeTeamId == null
            ? "left"
            : event.team.id === homeTeamId
              ? "left"
              : "right";
        return (
          <li key={event.id} className="relative">
            <EventItem event={event} align={align} />
          </li>
        );
      })}
    </ol>
  );
}
