"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Standing } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

export function useStandings(
  leagueId: number | null | undefined,
  season: number | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.standings(leagueId ?? 0, season ?? 0),
    queryFn: () =>
      apiFetch<Standing[]>(
        `/api/leagues/${leagueId}/standings?season=${season}`,
      ),
    staleTime: 300_000,
    enabled: enabled && Boolean(leagueId) && Boolean(season),
  });
}
