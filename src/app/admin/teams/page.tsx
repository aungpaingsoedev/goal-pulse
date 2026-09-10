"use client";

import { TeamCard } from "@/components/football/TeamCard";
import { EmptyState } from "@/components/football/EmptyState";
import { TeamCardSkeleton } from "@/components/football/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeams } from "@/hooks/use-team";
import { DEFAULT_SEASON } from "@/lib/football/constants";

export default function AdminTeamsPage() {
  const teamsQuery = useTeams({ league: 39, season: DEFAULT_SEASON });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Teams"
        description="Premier League clubs currently cached."
      />
      {teamsQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      ) : teamsQuery.isError ? (
        <EmptyState
          title="Couldn’t load teams"
          actionLabel="Retry"
          onAction={() => void teamsQuery.refetch()}
        />
      ) : !(teamsQuery.data?.length) ? (
        <EmptyState title="No teams" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teamsQuery.data.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
