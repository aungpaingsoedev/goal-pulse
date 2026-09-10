"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Player } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

export function usePlayers(params?: {
  search?: string;
  team?: number;
  season?: number;
  page?: number;
  enabled?: boolean;
}) {
  const { enabled = true, ...filters } = params ?? {};
  const canFetch = Boolean(filters.search || filters.team);

  return useQuery({
    queryKey: queryKeys.players(filters),
    queryFn: () => {
      const search = new URLSearchParams();
      if (filters.search) search.set("search", filters.search);
      if (filters.team) search.set("team", String(filters.team));
      if (filters.season) search.set("season", String(filters.season));
      if (filters.page) search.set("page", String(filters.page));
      return apiFetch<Player[]>(`/api/players?${search.toString()}`);
    },
    staleTime: 600_000,
    enabled: enabled && canFetch,
  });
}

export function usePlayer(
  id: number | null | undefined,
  season?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.player(id ?? 0, season),
    queryFn: () => {
      const qs = season ? `?season=${season}` : "";
      return apiFetch<Player>(`/api/players/${id}${qs}`);
    },
    staleTime: 600_000,
    enabled: enabled && Boolean(id),
  });
}
