"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  connectRealtime,
  disconnectRealtime,
  subscribeToAllFixtures,
} from "@/lib/realtime/client";
import { REALTIME_EVENTS } from "@/lib/realtime/events";
import { queryKeys } from "@/hooks/query-keys";
import type { Fixture } from "@/types/football";

/**
 * Keeps TanStack Query in sync with Socket.IO live events.
 * Mount once inside AppProviders when realtime URL is available.
 */
export function RealtimeBridge() {
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      connectRealtime();
    } catch {
      return;
    }

    const unsubscribe = subscribeToAllFixtures((event, payload) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.liveMatches });

      if (
        event === REALTIME_EVENTS.FIXTURE_UPDATED &&
        payload &&
        typeof payload === "object" &&
        "fixture" in payload
      ) {
        const fixture = (payload as { fixture: Fixture }).fixture;
        queryClient.setQueryData(queryKeys.fixture(fixture.id), fixture);
        queryClient.setQueryData<Fixture[]>(queryKeys.liveMatches, (old) => {
          if (!old) return old;
          const idx = old.findIndex((f) => f.id === fixture.id);
          if (idx === -1) return [fixture, ...old];
          const next = [...old];
          next[idx] = fixture;
          return next;
        });
      }
    });

    return () => {
      unsubscribe();
      disconnectRealtime();
    };
  }, [queryClient]);

  return null;
}
