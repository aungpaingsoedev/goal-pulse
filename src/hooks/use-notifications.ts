"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { AppNotification } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => apiFetch<AppNotification[]>("/api/notifications"),
    enabled,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id?: string; ids?: string[]; all?: boolean }) =>
      apiFetch<AppNotification[]>("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      const previous = queryClient.getQueryData<AppNotification[]>(
        queryKeys.notifications,
      );

      queryClient.setQueryData<AppNotification[]>(
        queryKeys.notifications,
        (old = []) =>
          old.map((n) => {
            if (input.all) return { ...n, read: true };
            if (input.ids?.includes(n.id)) return { ...n, read: true };
            if (input.id && n.id === input.id) return { ...n, read: true };
            return n;
          }),
      );

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications,
      });
    },
  });
}
