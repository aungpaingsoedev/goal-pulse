"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Favorite, FavoriteType } from "@/types/football";
import { queryKeys } from "@/hooks/query-keys";

export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: () => apiFetch<Favorite[]>("/api/favorites"),
    enabled,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { type: FavoriteType; entityId: number }) =>
      apiFetch<Favorite>("/api/favorites", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      const previous = queryClient.getQueryData<Favorite[]>(queryKeys.favorites);

      const optimistic: Favorite = {
        id: `temp-${input.type}-${input.entityId}`,
        userId: "optimistic",
        type: input.type,
        entityId: input.entityId,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Favorite[]>(queryKeys.favorites, (old = []) => {
        const exists = old.some(
          (f) => f.type === input.type && f.entityId === input.entityId,
        );
        return exists ? old : [optimistic, ...old];
      });

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.favorites, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id?: string;
      type?: FavoriteType;
      entityId?: number;
    }) =>
      apiFetch<{ removed: boolean }>("/api/favorites", {
        method: "DELETE",
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      const previous = queryClient.getQueryData<Favorite[]>(queryKeys.favorites);

      queryClient.setQueryData<Favorite[]>(queryKeys.favorites, (old = []) =>
        old.filter((f) => {
          if (input.id) return f.id !== input.id;
          if (input.type && input.entityId) {
            return !(f.type === input.type && f.entityId === input.entityId);
          }
          return true;
        }),
      );

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.favorites, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}
