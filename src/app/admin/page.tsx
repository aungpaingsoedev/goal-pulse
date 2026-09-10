"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/football/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/hooks/query-keys";

type AdminStats = {
  liveMatches: number;
  todaysMatches: number;
  leagues: number;
  trackedTeams: number | null;
  users: number | null;
  cacheEntries: number;
  mockMode: boolean;
  lastSynchronization: string | null;
  lastSyncAction: string | null;
  lastSyncRecords: number | null;
  syncStatus: string;
  generatedAt: string;
};

export default function AdminHomePage() {
  const { data: stats, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: () => apiFetch<AdminStats>("/api/admin/stats"),
  });

  const cards = stats
    ? [
        ["Live matches", stats.liveMatches],
        ["Today’s fixtures", stats.todaysMatches],
        ["Leagues", stats.leagues],
        ["Users", stats.users ?? "—"],
        ["Cache entries", stats.cacheEntries],
        ["Last sync", stats.lastSyncAction ?? "idle"],
      ]
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Admin overview"
        description="Operational snapshot for GoalPulse."
        actions={
          stats?.mockMode ? (
            <Badge variant="warning">Mock mode</Badge>
          ) : (
            <Badge variant="live">Live API</Badge>
          )
        }
      />

      {isLoading || isFetching ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title={error instanceof Error ? error.message : "Failed to load stats"}
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
