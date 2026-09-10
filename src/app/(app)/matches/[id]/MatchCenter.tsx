"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/football/EmptyState";
import { EventTimeline } from "@/components/football/EventTimeline";
import { FavoriteButton } from "@/components/football/FavoriteButton";
import { LeagueBadge } from "@/components/football/LeagueBadge";
import { MatchCardSkeleton, MatchCenterSkeleton } from "@/components/football/LoadingSkeleton";
import { MatchStatus } from "@/components/football/MatchStatus";
import { ScoreDisplay } from "@/components/football/ScoreDisplay";
import { StatBar } from "@/components/football/StatBar";
import { StatComparison } from "@/components/football/StatComparison";
import { TeamLogo } from "@/components/football/TeamLogo";
import { MatchCard } from "@/components/football/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFixture } from "@/hooks/use-fixture";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/use-favorites";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { Fixture } from "@/types/football";
import { LIVE_STATUSES } from "@/types/football";

function numericValue(value: number | string | null): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const n = Number(String(value).replace("%", "").trim());
  return Number.isFinite(n) ? n : 0;
}

const OVERVIEW_STATS = [
  "Ball Possession",
  "Total Shots",
  "Shots on Goal",
  "Corner Kicks",
  "Fouls",
  "Yellow Cards",
  "Red Cards",
];

export function MatchCenter({ fixtureId }: { fixtureId: number }) {
  const fixtureQuery = useFixture(fixtureId);
  const favoritesQuery = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const fixture = fixtureQuery.data;
  const isLive = fixture ? LIVE_STATUSES.includes(fixture.status) : false;

  const isFavorite = useMemo(
    () =>
      (favoritesQuery.data ?? []).some(
        (f) => f.type === "fixture" && f.entityId === fixtureId,
      ),
    [favoritesQuery.data, fixtureId],
  );

  const h2hQuery = useQuery({
    queryKey: ["h2h", fixture?.home.id, fixture?.away.id],
    queryFn: () =>
      apiFetch<Fixture[]>(
        `/api/fixtures/h2h?team1=${fixture!.home.id}&team2=${fixture!.away.id}&last=8`,
      ),
    enabled: Boolean(fixture?.home.id && fixture?.away.id),
    staleTime: 300_000,
  });

  const chartData = useMemo(() => {
    if (!fixture?.statistics || fixture.statistics.length < 2) return [];
    const [home, away] = fixture.statistics;
    return home.statistics
      .filter((s) =>
        ["Total Shots", "Shots on Goal", "Corner Kicks", "Fouls"].includes(
          s.type,
        ),
      )
      .map((s) => {
        const awayStat = away.statistics.find((a) => a.type === s.type);
        return {
          name: s.type.replace("Shots on Goal", "On target").replace("Corner Kicks", "Corners"),
          home: numericValue(s.value),
          away: numericValue(awayStat?.value ?? 0),
        };
      });
  }, [fixture?.statistics]);

  if (fixtureQuery.isLoading) {
    return <MatchCenterSkeleton />;
  }

  if (fixtureQuery.isError || !fixture) {
    return (
      <EmptyState
        title="Match unavailable"
        description="This fixture could not be loaded."
        actionLabel="Retry"
        onAction={() => void fixtureQuery.refetch()}
      />
    );
  }

  const stats = fixture.statistics ?? [];
  const homeStats = stats[0];
  const awayStats = stats[1];

  return (
    <div className="space-y-4">
      <header
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-card",
          isLive && "border-live/30",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2 sm:px-4">
          <LeagueBadge league={fixture.league} />
          <div className="flex items-center gap-1">
            <MatchStatus
              status={fixture.status}
              elapsed={fixture.elapsed}
              kickoff={fixture.date}
            />
            <FavoriteButton
              active={isFavorite}
              onToggle={() => {
                if (isFavorite) {
                  removeFavorite.mutate({
                    type: "fixture",
                    entityId: fixtureId,
                  });
                } else {
                  addFavorite.mutate({ type: "fixture", entityId: fixtureId });
                }
              }}
            />
          </div>
        </div>

        <div className="px-3 py-4 sm:px-6 sm:py-6">
          <p className="mb-3 text-center text-[11px] text-muted-foreground sm:mb-4">
            {fixture.league.round ? `${fixture.league.round} · ` : ""}
            {format(new Date(fixture.date), "EEE d MMM · HH:mm")}
            {fixture.venue.name ? ` · ${fixture.venue.name}` : ""}
          </p>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 flex-col items-center gap-2 text-center">
              <TeamLogo
                src={fixture.home.logo}
                name={fixture.home.name}
                size={48}
              />
              <p className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base">
                {fixture.home.name}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1 px-1">
              <ScoreDisplay
                home={fixture.goals.home}
                away={fixture.goals.away}
                size="lg"
                className="text-2xl sm:text-4xl"
              />
              {fixture.score.halftime.home != null ? (
                <span className="font-mono text-[10px] text-muted-foreground">
                  HT {fixture.score.halftime.home}–{fixture.score.halftime.away}
                </span>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col items-center gap-2 text-center">
              <TeamLogo
                src={fixture.away.logo}
                name={fixture.away.name}
                size={48}
              />
              <p className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base">
                {fixture.away.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {(
            [
              ["overview", "Overview"],
              ["timeline", "Timeline"],
              ["statistics", "Statistics"],
              ["lineups", "Lineups"],
              ["h2h", "H2H"],
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

        <TabsContent value="overview" className="mt-4 space-y-3">
          {!homeStats || !awayStats ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Stats will appear once available.
            </p>
          ) : (
            OVERVIEW_STATS.map((label) => {
              const home = homeStats.statistics.find((s) => s.type === label);
              const away = awayStats.statistics.find((s) => s.type === label);
              if (!home && !away) return null;
              return (
                <StatBar
                  key={label}
                  label={label}
                  homeValue={numericValue(home?.value ?? 0)}
                  awayValue={numericValue(away?.value ?? 0)}
                />
              );
            })
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <EventTimeline
            events={fixture.events ?? []}
            homeTeamId={fixture.home.id}
          />
        </TabsContent>

        <TabsContent value="statistics" className="mt-4 space-y-6">
          {chartData.length > 0 ? (
            <div className="h-64 w-full rounded-lg border border-border bg-card/60 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="home"
                    name={fixture.home.name}
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="away"
                    name={fixture.away.name}
                    fill="var(--muted-foreground)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
          <StatComparison statistics={stats} />
        </TabsContent>

        <TabsContent value="lineups" className="mt-4">
          {!fixture.lineups?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Lineups not published yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {fixture.lineups.map((lineup) => (
                <div
                  key={lineup.team.id}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <TeamLogo
                        src={lineup.team.logo}
                        name={lineup.team.name}
                        size={22}
                      />
                      <span className="text-sm font-semibold">
                        {lineup.team.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {lineup.formation ?? "—"}
                    </span>
                  </div>
                  <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Starting XI
                  </p>
                  <ul className="space-y-1.5">
                    {lineup.startXI.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="w-6 font-mono text-xs text-muted-foreground">
                          {p.number ?? "—"}
                        </span>
                        <span className="flex-1 truncate">{p.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.pos}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {lineup.substitutes.length ? (
                    <>
                      <p className="mt-4 mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                        Bench
                      </p>
                      <ul className="space-y-1.5">
                        {lineup.substitutes.map((p) => (
                          <li
                            key={p.id}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <span className="w-6 font-mono text-xs">
                              {p.number ?? "—"}
                            </span>
                            <span className="flex-1 truncate">{p.name}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="h2h" className="mt-4">
          {h2hQuery.isLoading ? (
            <div className="grid gap-3">
              <MatchCardSkeleton />
              <MatchCardSkeleton />
            </div>
          ) : h2hQuery.isError ? (
            <EmptyState
              title="Couldn’t load H2H"
              actionLabel="Retry"
              onAction={() => void h2hQuery.refetch()}
            />
          ) : !(h2hQuery.data?.length) ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No recent meetings found.
            </p>
          ) : (
            <div className="grid gap-3">
              {h2hQuery.data.map((m) => (
                <MatchCard key={m.id} fixture={m} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
