import { cn } from "@/lib/utils";
import type { MatchEvent } from "@/types/football";
import { TeamLogo } from "@/components/football/TeamLogo";

export interface EventItemProps {
  event: MatchEvent;
  align?: "left" | "right" | "center";
  className?: string;
}

function eventGlyph(event: MatchEvent) {
  if (event.type === "Goal") {
    if (event.detail.toLowerCase().includes("own")) return "⚽ OG";
    if (event.detail.toLowerCase().includes("penalty")) return "⚽ PEN";
    return "⚽";
  }
  if (event.type === "Card") {
    if (event.detail.toLowerCase().includes("red")) return "🟥";
    return "🟨";
  }
  if (event.type === "subst") return "🔄";
  if (event.type === "Var") return "VAR";
  return "•";
}

export function EventItem({
  event,
  align = "left",
  className,
}: EventItemProps) {
  const minute =
    event.time.extra != null
      ? `${event.time.elapsed}+${event.time.extra}'`
      : `${event.time.elapsed}'`;

  return (
    <div
      className={cn(
        "flex items-start gap-2 text-sm",
        align === "right" && "flex-row-reverse text-right",
        align === "center" && "justify-center text-center",
        className,
      )}
    >
      <span className="mt-0.5 w-10 shrink-0 font-mono text-xs text-muted-foreground">
        {minute}
      </span>
      <span className="mt-0.5 w-8 shrink-0 text-center text-xs">
        {eventGlyph(event)}
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-1.5">
          {align !== "center" ? (
            <TeamLogo
              src={event.team.logo}
              name={event.team.name}
              size={16}
            />
          ) : null}
          <p className="truncate font-medium">
            {event.player.name ?? event.detail}
          </p>
        </div>
        {event.type === "subst" && event.assist.name ? (
          <p className="truncate text-xs text-muted-foreground">
            Off: {event.assist.name}
          </p>
        ) : event.assist.name ? (
          <p className="truncate text-xs text-muted-foreground">
            Assist: {event.assist.name}
          </p>
        ) : null}
        {event.comments ? (
          <p className="text-xs text-muted-foreground">{event.comments}</p>
        ) : null}
      </div>
    </div>
  );
}
