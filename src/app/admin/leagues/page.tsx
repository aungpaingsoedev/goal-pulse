"use client";

import { LeagueCard } from "@/components/football/LeagueCard";
import { EmptyState } from "@/components/football/EmptyState";
import { LeagueCardSkeleton } from "@/components/football/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLeagues } from "@/hooks/use-league";

export default function AdminLeaguesPage() {
  const leaguesQuery = useLeagues({ current: true });

  return (
    <div className="space-y-5">
      <PageHeader title="Leagues" description="Competitions in the cache." />
      {leaguesQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <LeagueCardSkeleton />
          <LeagueCardSkeleton />
        </div>
      ) : leaguesQuery.isError ? (
        <EmptyState
          title="Couldn’t load leagues"
          actionLabel="Retry"
          onAction={() => void leaguesQuery.refetch()}
        />
      ) : !(leaguesQuery.data?.length) ? (
        <EmptyState title="No leagues" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {leaguesQuery.data.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      )}
    </div>
  );
}
