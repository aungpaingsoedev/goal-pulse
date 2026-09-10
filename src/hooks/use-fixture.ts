"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Fixture } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

export function useFixture(id: number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.fixture(id ?? 0),
    queryFn: () => apiFetch<Fixture>(`/api/fixtures/${id}`),
    enabled: enabled && Boolean(id),
  });
}
