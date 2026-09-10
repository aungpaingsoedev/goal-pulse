import Link from "next/link";
import { LeagueBadge } from "@/components/football/LeagueBadge";
import { MatchStatus } from "@/components/football/MatchStatus";
import { ScoreDisplay } from "@/components/football/ScoreDisplay";
import { TeamLogo } from "@/components/football/TeamLogo";
import { cn } from "@/lib/utils";
import type { Fixture } from "@/types/football";

export interface MatchCardProps {
  fixture: Fixture;
  className?: string;
  showLeague?: boolean;
}

export function MatchCard({
  fixture,
  className,
  showLeague = true,
}: MatchCardProps) {
  return (
    <Link
      href={`/matches/${fixture.id}`}
      className={cn(
        "group block rounded-lg border border-border bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-colors hover:border-border/80 hover:bg-card/90",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        {showLeague ? <LeagueBadge league={fixture.league} /> : <span />}
        <MatchStatus
          status={fixture.status}
          elapsed={fixture.elapsed}
          kickoff={fixture.date}
        />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-medium group-hover:text-foreground">
            {fixture.home.name}
          </span>
          <TeamLogo src={fixture.home.logo} name={fixture.home.name} size={24} />
        </div>

        <ScoreDisplay
          home={fixture.goals.home}
          away={fixture.goals.away}
          size="sm"
          className="px-1"
        />

        <div className="flex min-w-0 items-center gap-2">
          <TeamLogo src={fixture.away.logo} name={fixture.away.name} size={24} />
          <span className="truncate text-sm font-medium">{fixture.away.name}</span>
        </div>
      </div>
    </Link>
  );
}
