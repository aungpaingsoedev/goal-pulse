"use client";

import { useState } from "react";
import { FilterBar } from "@/components/football/FilterBar";
import { PlayerCard } from "@/components/football/PlayerCard";
import { EmptyState } from "@/components/football/EmptyState";
import { PlayerCardSkeleton } from "@/components/football/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { usePlayers } from "@/hooks/use-player";

export default function PlayersPage() {
  const [query, setQuery] = useState("");
  const playersQuery = usePlayers({
    search: query.trim() || undefined,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Players"
        description="Search footballers by name across competitions."
      />

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search players (min. 1 character)…"
        onClear={() => setQuery("")}
      />

      {!query.trim() ? (
        <EmptyState
          title="Search for a player"
          description="Type a name to find profiles and season stats."
        />
      ) : playersQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <PlayerCardSkeleton />
          <PlayerCardSkeleton />
          <PlayerCardSkeleton />
        </div>
      ) : playersQuery.isError ? (
        <EmptyState
          title="Couldn’t load players"
          actionLabel="Retry"
          onAction={() => void playersQuery.refetch()}
        />
      ) : !(playersQuery.data?.length) ? (
        <EmptyState title="No players found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {playersQuery.data.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
