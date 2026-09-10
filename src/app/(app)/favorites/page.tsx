"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/football/EmptyState";
import { FavoriteButton } from "@/components/football/FavoriteButton";
import { TeamCardSkeleton } from "@/components/football/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/use-favorites";
import { useTeams } from "@/hooks/use-team";
import { useLeagues } from "@/hooks/use-league";
import { DEFAULT_SEASON } from "@/lib/football/constants";
import type { Favorite } from "@/types/football";

function FavoriteRow({
  favorite,
  label,
  href,
  onRemove,
}: {
  favorite: Favorite;
  label: string;
  href: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <Link href={href} className="min-w-0 flex-1 hover:underline">
        <p className="truncate font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground capitalize">{favorite.type}</p>
      </Link>
      <FavoriteButton active onToggle={onRemove} />
    </div>
  );
}

export default function FavoritesPage() {
  const router = useRouter();
  const favoritesQuery = useFavorites();
  const removeFavorite = useRemoveFavorite();
  const teamsQuery = useTeams({ league: 39, season: DEFAULT_SEASON });
  const leaguesQuery = useLeagues({ current: true });

  const favorites = useMemo(
    () => favoritesQuery.data ?? [],
    [favoritesQuery.data],
  );

  const resolved = useMemo(() => {
    const teams = teamsQuery.data ?? [];
    const leagues = leaguesQuery.data ?? [];

    return favorites.map((fav) => {
      if (fav.type === "team") {
        const team = teams.find((t) => t.id === fav.entityId);
        return {
          favorite: fav,
          label: team?.name ?? `Team #${fav.entityId}`,
          href: `/teams/${fav.entityId}`,
        };
      }
      if (fav.type === "league") {
        const league = leagues.find((l) => l.id === fav.entityId);
        return {
          favorite: fav,
          label: league?.name ?? `League #${fav.entityId}`,
          href: `/leagues/${fav.entityId}`,
        };
      }
      if (fav.type === "player") {
        return {
          favorite: fav,
          label: `Player #${fav.entityId}`,
          href: `/players/${fav.entityId}`,
        };
      }
      return {
        favorite: fav,
        label: `Match #${fav.entityId}`,
        href: `/matches/${fav.entityId}`,
      };
    });
  }, [favorites, teamsQuery.data, leaguesQuery.data]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Favorites"
        description="Teams, leagues, players, and matches you follow."
      />

      {favoritesQuery.isLoading ? (
        <div className="grid gap-3">
          <TeamCardSkeleton />
          <TeamCardSkeleton />
        </div>
      ) : favoritesQuery.isError ? (
        <EmptyState
          title="Couldn’t load favorites"
          actionLabel="Retry"
          onAction={() => void favoritesQuery.refetch()}
        />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Star teams and matches from their pages. Sign in to sync across devices."
          actionLabel="Browse teams"
          onAction={() => router.push("/teams")}
        />
      ) : (
        <div className="space-y-3">
          {resolved.map(({ favorite, label, href }) => (
            <FavoriteRow
              key={favorite.id}
              favorite={favorite}
              label={label}
              href={href}
              onRemove={() =>
                removeFavorite.mutate({
                  id: favorite.id,
                  type: favorite.type,
                  entityId: favorite.entityId,
                })
              }
            />
          ))}
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/teams">Find more teams</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
