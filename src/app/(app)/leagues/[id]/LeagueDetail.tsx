"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { EmptyState } from "@/components/football/EmptyState";
import {
  LeagueCardSkeleton,
  MatchCardSkeleton,
  PlayerCardSkeleton,
  TableSkeleton,
  TeamCardSkeleton,
} from "@/components/football/LoadingSkeleton";
import { MatchCard } from "@/components/football/MatchCard";
import { PlayerCard } from "@/components/football/PlayerCard";
import { StandingsTable } from "@/components/football/StandingsTable";
import { TeamCard } from "@/components/football/TeamCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeague } from "@/hooks/use-league";
import { useStandings } from "@/hooks/use-standings";
import { useFixtures } from "@/hooks/use-fixtures";
import { useTeams } from "@/hooks/use-team";
import { apiFetch } from "@/lib/api/client";
import { DEFAULT_SEASON } from "@/lib/football/constants";
import { toDateKey } from "@/lib/football/fixture-utils";
import type { Player } from "@/types/football";

export function LeagueDetail({ leagueId }: { leagueId: number }) {
  const season = DEFAULT_SEASON;
  const leagueQuery = useLeague(leagueId, season);
  const standingsQuery = useStandings(leagueId, season);
  const fixturesQuery = useFixtures({
    date: toDateKey(new Date()),
    league: leagueId,
  });
  const teamsQuery = useTeams({ league: leagueId, season });

  const scorersQuery = useQuery({
    queryKey: ["top-scorers", leagueId, season],
    queryFn: () =>
      apiFetch<Player[]>(
        `/api/leagues/${leagueId}/top-scorers?season=${season}`,
      ),
    staleTime: 300_000,
  });

  const league = leagueQuery.data;

  const overviewBits = useMemo(() => {
    const standings = standingsQuery.data ?? [];
    return {
      leaders: standings.slice(0, 5),
      matchesToday: fixturesQuery.data?.length ?? 0,
      teams: teamsQuery.data?.length ?? 0,
    };
  }, [standingsQuery.data, fixturesQuery.data, teamsQuery.data]);

  if (leagueQuery.isLoading) {
    return <LeagueCardSkeleton className="h-28" />;
  }

  if (leagueQuery.isError || !league) {
    return (
      <EmptyState
        title="League unavailable"
        actionLabel="Retry"
        onAction={() => void leagueQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted p-1.5">
          <Image
            src={league.logo}
            alt={league.name}
            width={56}
            height={56}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {league.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {league.country}
            {league.season ? ` · ${league.season}` : ""}
            {league.round ? ` · ${league.round}` : ""}
          </p>
        </div>
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {(
            [
              ["overview", "Overview"],
              ["matches", "Matches"],
              ["standings", "Standings"],
              ["scorers", "Top Scorers"],
              ["teams", "Teams"],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-md border border-transparent data-[state=active]:border-border"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="mt-1 font-mono text-2xl font-bold">
                {overviewBits.matchesToday}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Teams</p>
              <p className="mt-1 font-mono text-2xl font-bold">
                {overviewBits.teams}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Season</p>
              <p className="mt-1 font-mono text-2xl font-bold">{season}</p>
            </div>
          </div>
          {standingsQuery.isLoading ? (
            <TableSkeleton rows={5} />
          ) : overviewBits.leaders.length ? (
            <StandingsTable standings={overviewBits.leaders} />
          ) : null}
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          {fixturesQuery.isLoading ? (
            <div className="grid gap-3">
              <MatchCardSkeleton />
              <MatchCardSkeleton />
            </div>
          ) : !(fixturesQuery.data?.length) ? (
            <EmptyState title="No matches today for this league" />
          ) : (
            <div className="grid gap-3">
              {fixturesQuery.data.map((f) => (
                <MatchCard key={f.id} fixture={f} showLeague={false} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="standings" className="mt-4">
          {standingsQuery.isLoading ? (
            <TableSkeleton />
          ) : standingsQuery.isError ? (
            <EmptyState
              title="Couldn’t load standings"
              actionLabel="Retry"
              onAction={() => void standingsQuery.refetch()}
            />
          ) : !(standingsQuery.data?.length) ? (
            <EmptyState title="Standings unavailable" />
          ) : (
            <StandingsTable standings={standingsQuery.data} />
          )}
        </TabsContent>

        <TabsContent value="scorers" className="mt-4">
          {scorersQuery.isLoading ? (
            <div className="grid gap-3">
              <PlayerCardSkeleton />
              <PlayerCardSkeleton />
            </div>
          ) : scorersQuery.isError ? (
            <EmptyState
              title="Couldn’t load scorers"
              actionLabel="Retry"
              onAction={() => void scorersQuery.refetch()}
            />
          ) : !(scorersQuery.data?.length) ? (
            <EmptyState title="No scorers data" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {scorersQuery.data.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="teams" className="mt-4">
          {teamsQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <TeamCardSkeleton />
              <TeamCardSkeleton />
            </div>
          ) : !(teamsQuery.data?.length) ? (
            <EmptyState title="No teams found" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {teamsQuery.data.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
