"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, Shirt, Trophy, Users, CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/football/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/use-search";
import type { SearchResult } from "@/types/football";
import { cn } from "@/lib/utils";

function hrefFor(result: SearchResult) {
  switch (result.type) {
    case "team":
      return `/teams/${result.id}`;
    case "player":
      return `/players/${result.id}`;
    case "league":
      return `/leagues/${result.id}`;
    case "fixture":
      return `/matches/${result.id}`;
    default:
      return "/";
  }
}

function iconFor(type: SearchResult["type"]) {
  switch (type) {
    case "team":
      return Shirt;
    case "player":
      return Users;
    case "league":
      return Trophy;
    default:
      return CalendarDays;
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const searchQuery = useSearch(query, { debounceMs: 300 });

  const grouped = useMemo(() => {
    const results = searchQuery.data ?? [];
    return {
      teams: results.filter((r) => r.type === "team"),
      players: results.filter((r) => r.type === "player"),
      leagues: results.filter((r) => r.type === "league"),
      fixtures: results.filter((r) => r.type === "fixture"),
    };
  }, [searchQuery.data]);

  const hasResults =
    grouped.teams.length +
      grouped.players.length +
      grouped.leagues.length +
      grouped.fixtures.length >
    0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Search"
        description="Find teams, players, leagues, and matches."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  bubbles: true,
                }),
              );
            }}
          >
            ⌘K command
          </Button>
        }
      />

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GoalPulse…"
          className="h-11 pl-9"
          autoFocus
        />
      </div>

      {!query.trim() ? (
        <EmptyState
          icon={SearchIcon}
          title="Start typing"
          description="Or press ⌘K / Ctrl+K anywhere for the command palette."
        />
      ) : searchQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Searching…</p>
      ) : searchQuery.isError ? (
        <EmptyState
          title="Search failed"
          actionLabel="Retry"
          onAction={() => void searchQuery.refetch()}
        />
      ) : !hasResults ? (
        <EmptyState title="No results" description="Try a different query." />
      ) : (
        <div className="space-y-6">
          {(
            [
              ["Teams", grouped.teams],
              ["Players", grouped.players],
              ["Leagues", grouped.leagues],
              ["Matches", grouped.fixtures],
            ] as const
          ).map(([heading, items]) =>
            items.length ? (
              <section key={heading}>
                <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  {heading}
                </h2>
                <ul className="space-y-1">
                  {items.map((item) => {
                    const Icon = iconFor(item.type);
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <Link
                          href={hrefFor(item)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-secondary",
                          )}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {item.name}
                          </span>
                          {item.subtitle ? (
                            <span className="truncate text-xs text-muted-foreground">
                              {item.subtitle}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
