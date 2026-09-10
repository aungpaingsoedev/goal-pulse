"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { LiveMatchCard } from "@/components/football/LiveMatchCard";
import { MatchCard } from "@/components/football/MatchCard";
import { EmptyState } from "@/components/football/EmptyState";
import { MatchCardSkeleton } from "@/components/football/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useLiveMatches } from "@/hooks/use-live-matches";
import { useFixtures } from "@/hooks/use-fixtures";
import { LIVE_FILTERS, isPopularLeagueId } from "@/lib/football/constants";
import {
  groupFixturesByLeague,
  isUpcomingStatus,
  toDateKey,
} from "@/lib/football/fixture-utils";
import { cn } from "@/lib/utils";

export default function LivePage() {
  const [filter, setFilter] = useState<string>("all");
  const liveQuery = useLiveMatches();
  const fixturesQuery = useFixtures({ date: toDateKey(new Date()) });

  const filtered = useMemo(() => {
    const fixtures = liveQuery.data ?? [];
    if (filter === "all") return fixtures;
    if (filter === "other") {
      return fixtures.filter((f) => !isPopularLeagueId(f.league.id));
    }
    const id = Number(filter);
    return fixtures.filter((f) => f.league.id === id);
  }, [liveQuery.data, filter]);

  const groups = useMemo(() => groupFixturesByLeague(filtered), [filtered]);

  const upcoming = useMemo(
    () =>
      (fixturesQuery.data ?? [])
        .filter((f) => isUpcomingStatus(f.status))
        .slice(0, 6),
    [fixturesQuery.data],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Live"
        description="Matches in play right now, grouped by competition."
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {LIVE_FILTERS.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            className={cn("shrink-0", filter === item.id && "shadow-none")}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {liveQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      ) : liveQuery.isError ? (
        <EmptyState
          title="Couldn’t load live matches"
          actionLabel="Retry"
          onAction={() => void liveQuery.refetch()}
        />
      ) : groups.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            icon={Radio}
            title="Nothing live"
            description="No matches match this filter right now. Kickoffs coming up:"
          />
          {upcoming.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  Upcoming
                </h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/matches">All matches</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {upcoming.map((fixture) => (
                  <MatchCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.league.id}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">{group.league.name}</h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {group.fixtures.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.fixtures.map((fixture) => (
                  <LiveMatchCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
