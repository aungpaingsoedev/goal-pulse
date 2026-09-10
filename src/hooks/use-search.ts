"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { SearchResult } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useSearch(
  query: string,
  options?: {
    type?: "all" | "team" | "league" | "player" | "fixture";
    limit?: number;
    debounceMs?: number;
    enabled?: boolean;
  },
) {
  const type = options?.type ?? "all";
  const limit = options?.limit ?? 20;
  const debounceMs = options?.debounceMs ?? 300;
  const debouncedQuery = useDebouncedValue(query.trim(), debounceMs);
  const enabled =
    (options?.enabled ?? true) && debouncedQuery.length >= 1;

  return useQuery({
    queryKey: queryKeys.search(debouncedQuery, type),
    queryFn: () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        type,
        limit: String(limit),
      });
      return apiFetch<SearchResult[]>(`/api/search?${params.toString()}`);
    },
    enabled,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}
