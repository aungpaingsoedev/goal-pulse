"use client";

import { useMemo, useState } from "react";
import { DateSelector } from "@/components/football/DateSelector";
import { FilterBar } from "@/components/football/FilterBar";
import { MatchCard } from "@/components/football/MatchCard";
import { LiveMatchCard } from "@/components/football/LiveMatchCard";
import { EmptyState } from "@/components/football/EmptyState";
import { MatchCardSkeleton } from "@/components/football/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useFixtures } from "@/hooks/use-fixtures";
import { POPULAR_LEAGUES } from "@/lib/football/constants";
import {
  isLiveStatus,
  splitFixturesByPhase,
  toDateKey,
} from "@/lib/football/fixture-utils";

export default function MatchesPage() {
  const [date, setDate] = useState(() => new Date());
  const [league, setLeague] = useState("all");
  const [status, setStatus] = useState("all");

  const dateKey = toDateKey(date);
  const leagueId = league === "all" ? undefined : Number(league);

  const fixturesQuery = useFixtures({
    date: dateKey,
    league: leagueId,
  });

  const phases = useMemo(() => {
    const all = fixturesQuery.data ?? [];
    const split = splitFixturesByPhase(all);
    if (status === "live") return { live: split.live, upcoming: [], finished: [] };
    if (status === "upcoming")
      return { live: [], upcoming: split.upcoming, finished: [] };
    if (status === "finished")
      return { live: [], upcoming: [], finished: split.finished };
    return split;
  }, [fixturesQuery.data, status]);

  const empty =
    !fixturesQuery.isLoading &&
    phases.live.length === 0 &&
    phases.upcoming.length === 0 &&
    phases.finished.length === 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Matches"
        description="Browse fixtures by date, competition, and status."
      />

      <DateSelector value={date} onChange={setDate} />

      <FilterBar
        filters={[
          {
            id: "league",
            label: "League",
            value: league,
            onChange: setLeague,
            options: [
              { label: "All leagues", value: "all" },
              ...POPULAR_LEAGUES.map((l) => ({
                label: l.name,
                value: String(l.id),
              })),
            ],
          },
          {
            id: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { label: "All statuses", value: "all" },
              { label: "Live", value: "live" },
              { label: "Upcoming", value: "upcoming" },
              { label: "Finished", value: "finished" },
            ],
          },
        ]}
        onClear={() => {
          setLeague("all");
          setStatus("all");
        }}
      />

      {fixturesQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      ) : fixturesQuery.isError ? (
        <EmptyState
          title="Couldn’t load matches"
          actionLabel="Retry"
          onAction={() => void fixturesQuery.refetch()}
        />
      ) : empty ? (
        <EmptyState
          title="No matches"
          description="Try another date or clear filters."
        />
      ) : (
        <div className="space-y-7">
          {phases.live.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Live
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {phases.live.map((fixture) =>
                  isLiveStatus(fixture.status) ? (
                    <LiveMatchCard key={fixture.id} fixture={fixture} />
                  ) : (
                    <MatchCard key={fixture.id} fixture={fixture} />
                  ),
                )}
              </div>
            </section>
          ) : null}

          {phases.upcoming.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Upcoming
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {phases.upcoming.map((fixture) => (
                  <MatchCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </section>
          ) : null}

          {phases.finished.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                Finished
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {phases.finished.map((fixture) => (
                  <MatchCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
