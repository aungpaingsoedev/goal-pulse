"use client";

import { useState } from "react";
import { FilterBar } from "@/components/football/FilterBar";
import { TeamCard } from "@/components/football/TeamCard";
import { EmptyState } from "@/components/football/EmptyState";
import { TeamCardSkeleton } from "@/components/football/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTeams } from "@/hooks/use-team";
import { DEFAULT_SEASON, POPULAR_LEAGUES } from "@/lib/football/constants";

export default function TeamsPage() {
  const [query, setQuery] = useState("");
  const [league, setLeague] = useState("39");

  const teamsQuery = useTeams({
    search: query.trim() || undefined,
    league: Number(league),
    season: DEFAULT_SEASON,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Teams"
        description="Browse clubs by competition or search by name."
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search teams…"
        filters={[
          {
            id: "league",
            label: "League",
            value: league,
            onChange: setLeague,
            options: POPULAR_LEAGUES.filter((l) => l.id !== 2).map((l) => ({
              label: l.name,
              value: String(l.id),
            })),
          },
        ]}
        onClear={() => {
          setQuery("");
          setLeague("39");
        }}
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
        <EmptyState title="No teams found" description="Try another search." />
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
