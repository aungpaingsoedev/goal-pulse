"use client";

import { useMemo } from "react";
import { LeagueCard } from "@/components/football/LeagueCard";
import { EmptyState } from "@/components/football/EmptyState";
import { LeagueCardSkeleton } from "@/components/football/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLeagues } from "@/hooks/use-league";
import { POPULAR_LEAGUE_IDS } from "@/lib/football/constants";

export default function LeaguesPage() {
  const leaguesQuery = useLeagues({ current: true });

  const leagues = useMemo(() => {
    const all = leaguesQuery.data ?? [];
    const popular = all.filter((l) =>
      (POPULAR_LEAGUE_IDS as readonly number[]).includes(l.id),
    );
    const rest = all.filter(
      (l) => !(POPULAR_LEAGUE_IDS as readonly number[]).includes(l.id),
    );
    return [...popular, ...rest];
  }, [leaguesQuery.data]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leagues"
        description="Popular competitions and more from around the world."
      />

      {leaguesQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LeagueCardSkeleton key={i} />
          ))}
        </div>
      ) : leaguesQuery.isError ? (
        <EmptyState
          title="Couldn’t load leagues"
          actionLabel="Retry"
          onAction={() => void leaguesQuery.refetch()}
        />
      ) : leagues.length === 0 ? (
        <EmptyState title="No leagues found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      )}
    </div>
  );
}
