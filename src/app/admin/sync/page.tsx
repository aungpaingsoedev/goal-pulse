"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import { DEFAULT_SEASON } from "@/lib/football/constants";

const ACTIONS = [
  { action: "sync_live", label: "Sync live", body: { action: "sync_live" } },
  {
    action: "sync_fixtures",
    label: "Sync today’s fixtures",
    body: { action: "sync_fixtures" },
  },
  {
    action: "sync_leagues",
    label: "Sync leagues",
    body: { action: "sync_leagues" },
  },
  {
    action: "sync_teams",
    label: "Sync PL teams",
    body: { action: "sync_teams", leagueId: 39, season: DEFAULT_SEASON },
  },
  {
    action: "sync_standings",
    label: "Sync PL standings",
    body: {
      action: "sync_standings",
      leagueId: 39,
      season: DEFAULT_SEASON,
    },
  },
  {
    action: "invalidate_cache",
    label: "Invalidate cache",
    body: { action: "invalidate_cache" },
  },
] as const;

export default function AdminSyncPage() {
  const [pending, setPending] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  async function run(action: string, body: Record<string, unknown>) {
    setPending(action);
    try {
      const result = await apiFetch<Record<string, unknown>>(
        "/api/admin/sync",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      );
      const line = `${action}: ${JSON.stringify(result)}`;
      setLog((prev) => [line, ...prev].slice(0, 12));
      toast.success(`${action} complete`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed";
      setLog((prev) => [`${action}: ERROR ${message}`, ...prev].slice(0, 12));
      toast.error(message);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sync"
        description="Refresh football data caches and invalidate keys."
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((item) => (
          <Button
            key={item.action}
            type="button"
            variant="outline"
            className="justify-start"
            disabled={pending !== null}
            onClick={() => void run(item.action, { ...item.body })}
          >
            {pending === item.action ? "Running…" : item.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Activity</h2>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">No syncs yet this session.</p>
        ) : (
          <ul className="space-y-2 font-mono text-xs text-muted-foreground">
            {log.map((line, i) => (
              <li key={`${i}-${line.slice(0, 24)}`} className="break-all">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
