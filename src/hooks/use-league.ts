"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { League } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

export function useLeagues(params?: {
  country?: string;
  season?: number;
  current?: boolean;
  enabled?: boolean;
}) {
  const { enabled = true, ...filters } = params ?? {};

  return useQuery({
    queryKey: queryKeys.leagues(filters),
    queryFn: () => {
      const search = new URLSearchParams();
      if (filters.country) search.set("country", filters.country);
      if (filters.season) search.set("season", String(filters.season));
      if (filters.current !== undefined) {
        search.set("current", String(filters.current));
      }
      const qs = search.toString();
      return apiFetch<League[]>(`/api/leagues${qs ? `?${qs}` : ""}`);
    },
    staleTime: 600_000,
    enabled,
  });
}

export function useLeague(
  id: number | null | undefined,
  season?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.league(id ?? 0, season),
    queryFn: () => {
      const qs = season ? `?season=${season}` : "";
      return apiFetch<League>(`/api/leagues/${id}${qs}`);
    },
    staleTime: 600_000,
    enabled: enabled && Boolean(id),
  });
}
