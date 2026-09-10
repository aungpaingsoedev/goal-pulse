"use client";

import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/football/EmptyState";
import { FavoriteButton } from "@/components/football/FavoriteButton";
import { PlayerCardSkeleton } from "@/components/football/LoadingSkeleton";
import { usePlayer } from "@/hooks/use-player";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/use-favorites";
import { useMemo } from "react";

export function PlayerDetail({ playerId }: { playerId: number }) {
  const playerQuery = usePlayer(playerId);
  const favoritesQuery = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorite = useMemo(
    () =>
      (favoritesQuery.data ?? []).some(
        (f) => f.type === "player" && f.entityId === playerId,
      ),
    [favoritesQuery.data, playerId],
  );

  if (playerQuery.isLoading) {
    return <PlayerCardSkeleton className="h-40" />;
  }

  if (playerQuery.isError || !playerQuery.data) {
    return (
      <EmptyState
        title="Player unavailable"
        actionLabel="Retry"
        onAction={() => void playerQuery.refetch()}
      />
    );
  }

  const player = playerQuery.data;

  const cards = [
    ["Age", player.age ?? "—"],
    ["Position", player.position ?? "—"],
    ["Number", player.number != null ? `#${player.number}` : "—"],
    ["Nationality", player.nationality ?? "—"],
    ["Height", player.height ?? "—"],
    ["Weight", player.weight ?? "—"],
  ] as const;

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={player.photo}
            alt={player.name}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {player.name}
              </h1>
              {player.team ? (
                <Link
                  href={`/teams/${player.team.id}`}
                  className="mt-1 inline-block text-sm text-muted-foreground hover:text-foreground"
                >
                  {player.team.name}
                </Link>
              ) : null}
            </div>
            <FavoriteButton
              active={isFavorite}
              onToggle={() => {
                if (isFavorite) {
                  removeFavorite.mutate({ type: "player", entityId: playerId });
                } else {
                  addFavorite.mutate({ type: "player", entityId: playerId });
                }
              }}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-3"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 truncate font-mono text-lg font-semibold">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
