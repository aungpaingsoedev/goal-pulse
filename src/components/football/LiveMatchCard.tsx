import Link from "next/link";
import { LeagueBadge } from "@/components/football/LeagueBadge";
import { LiveIndicator } from "@/components/football/LiveIndicator";
import { ScoreDisplay } from "@/components/football/ScoreDisplay";
import { TeamLogo } from "@/components/football/TeamLogo";
import { cn } from "@/lib/utils";
import type { Fixture, MatchEvent } from "@/types/football";

function eventPreview(events: MatchEvent[] | undefined) {
  if (!events?.length) return [];
  return events
    .slice()
    .reverse()
    .filter((e) => e.type === "Goal" || e.type === "Card")
    .slice(0, 3)
    .map((e) => {
      if (e.type === "Goal") {
        return {
          id: e.id,
          icon: "⚽",
          label: e.player.name ?? "Goal",
          minute: e.time.elapsed,
        };
      }
      const yellow =
        e.detail.toLowerCase().includes("yellow") ||
        e.detail === "Yellow Card";
      return {
        id: e.id,
        icon: yellow ? "🟨" : "🟥",
        label: e.player.name ?? e.detail,
        minute: e.time.elapsed,
      };
    });
}

export interface LiveMatchCardProps {
  fixture: Fixture;
  className?: string;
}

export function LiveMatchCard({ fixture, className }: LiveMatchCardProps) {
  const previews = eventPreview(fixture.events);
  const clock =
    fixture.status === "HT"
      ? "HT"
      : fixture.elapsed != null
        ? `${fixture.elapsed}'`
        : fixture.status;

  return (
    <Link
      href={`/matches/${fixture.id}`}
      className={cn(
        "block rounded-lg border border-live/25 bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-colors hover:border-live/40",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <LeagueBadge league={fixture.league} />
        <div className="flex items-center gap-2">
          <LiveIndicator />
          <span className="font-mono text-xs font-semibold text-live">
            {clock}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-semibold">
            {fixture.home.name}
          </span>
          <TeamLogo src={fixture.home.logo} name={fixture.home.name} size={28} />
        </div>
        <ScoreDisplay
          home={fixture.goals.home}
          away={fixture.goals.away}
          size="md"
        />
        <div className="flex min-w-0 items-center gap-2">
          <TeamLogo src={fixture.away.logo} name={fixture.away.name} size={28} />
          <span className="truncate text-sm font-semibold">
            {fixture.away.name}
          </span>
        </div>
      </div>

      {previews.length > 0 ? (
        <ul className="mt-2 space-y-1 border-t border-border/70 pt-2">
          {previews.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <span className="w-5 text-center">{p.icon}</span>
              <span className="font-mono text-[11px] text-foreground/70">
                {p.minute}&apos;
              </span>
              <span className="truncate">{p.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}
