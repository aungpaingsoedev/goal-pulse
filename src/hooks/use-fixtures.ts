"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Fixture } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

export interface UseFixturesOptions {
  date: string;
  league?: number;
  status?: string;
  enabled?: boolean;
}

export function useFixtures({
  date,
  league,
  status,
  enabled = true,
}: UseFixturesOptions) {
  return useQuery({
    queryKey: queryKeys.fixtures(date, league, status),
    queryFn: () => {
      const params = new URLSearchParams({ date });
      if (league) params.set("league", String(league));
      if (status) params.set("status", status);
      return apiFetch<Fixture[]>(`/api/fixtures?${params.toString()}`);
    },
    staleTime: 60_000,
    enabled: enabled && Boolean(date),
  });
}
