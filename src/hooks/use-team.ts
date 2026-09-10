"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Fixture, Team } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

export type TeamDetailResponse = {
  team: Team;
  recent: Fixture[];
  next: Fixture[];
};

export function useTeams(params?: {
  search?: string;
  league?: number;
  season?: number;
  enabled?: boolean;
}) {
  const { enabled = true, ...filters } = params ?? {};

  return useQuery({
    queryKey: queryKeys.teams(filters),
    queryFn: () => {
      const search = new URLSearchParams();
      if (filters.search) search.set("search", filters.search);
      if (filters.league) search.set("league", String(filters.league));
      if (filters.season) search.set("season", String(filters.season));
      const qs = search.toString();
      return apiFetch<Team[]>(`/api/teams${qs ? `?${qs}` : ""}`);
    },
    staleTime: 600_000,
    enabled,
  });
}

export function useTeam(id: number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.team(id ?? 0),
    queryFn: () => apiFetch<TeamDetailResponse>(`/api/teams/${id}`),
    staleTime: 300_000,
    enabled: enabled && Boolean(id),
  });
}
