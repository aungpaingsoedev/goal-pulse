"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/football/EmptyState";
import { FavoriteButton } from "@/components/football/FavoriteButton";
import {
  MatchCardSkeleton,
  PlayerCardSkeleton,
  TeamCardSkeleton,
} from "@/components/football/LoadingSkeleton";
import { MatchCard } from "@/components/football/MatchCard";
import { PlayerCard } from "@/components/football/PlayerCard";
import { TeamLogo } from "@/components/football/TeamLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeam } from "@/hooks/use-team";
import { usePlayers } from "@/hooks/use-player";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/use-favorites";
import { DEFAULT_SEASON } from "@/lib/football/constants";

export function TeamDetail({ teamId }: { teamId: number }) {
  const teamQuery = useTeam(teamId);
  const playersQuery = usePlayers({ team: teamId, season: DEFAULT_SEASON });
  const favoritesQuery = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorite = useMemo(
    () =>
      (favoritesQuery.data ?? []).some(
        (f) => f.type === "team" && f.entityId === teamId,
      ),
    [favoritesQuery.data, teamId],
  );

  if (teamQuery.isLoading) {
    return <TeamCardSkeleton className="h-32" />;
  }

  if (teamQuery.isError || !teamQuery.data) {
    return (
      <EmptyState
        title="Team unavailable"
        actionLabel="Retry"
        onAction={() => void teamQuery.refetch()}
      />
    );
  }

  const { team, recent, next } = teamQuery.data;

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <TeamLogo src={team.logo} name={team.name} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {team.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {[team.code, team.country, team.founded ? `Est. ${team.founded}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {team.venue?.name ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {team.venue.name}
                  {team.venue.city ? ` · ${team.venue.city}` : ""}
                </p>
              ) : null}
            </div>
            <FavoriteButton
              active={isFavorite}
              onToggle={() => {
                if (isFavorite) {
                  removeFavorite.mutate({ type: "team", entityId: teamId });
                } else {
                  addFavorite.mutate({ type: "team", entityId: teamId });
                }
              }}
            />
          </div>
        </div>
      </header>

      <Tabs defaultValue="fixtures">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {(
            [
              ["fixtures", "Fixtures"],
              ["squad", "Squad"],
              ["stats", "Stats"],
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

        <TabsContent value="fixtures" className="mt-4 space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Next
            </h2>
            {next.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming fixtures.</p>
            ) : (
              <div className="grid gap-3">
                {next.map((f) => (
                  <MatchCard key={f.id} fixture={f} />
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              Last matches
            </h2>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent results.</p>
            ) : (
              <div className="grid gap-3">
                {recent.map((f) => (
                  <MatchCard key={f.id} fixture={f} />
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="squad" className="mt-4">
          {playersQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <PlayerCardSkeleton />
              <PlayerCardSkeleton />
            </div>
          ) : !(playersQuery.data?.length) ? (
            <EmptyState title="Squad unavailable" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {playersQuery.data.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Recent", recent.length],
              ["Upcoming", next.length],
              ["Capacity", team.venue?.capacity ?? "—"],
              ["Founded", team.founded ?? "—"],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-lg border border-border bg-card p-3"
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 font-mono text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          {teamQuery.isFetching ? (
            <div className="mt-4">
              <MatchCardSkeleton />
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
