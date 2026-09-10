"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Fixture } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

export function useLiveMatches(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.liveMatches,
    queryFn: () => apiFetch<Fixture[]>("/api/football/live"),
    refetchInterval: 15_000,
    enabled: options?.enabled ?? true,
  });
}
