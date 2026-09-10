"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Loader2, Search, Trophy, Users, Shirt } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSearch } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/types/football";

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

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchQuery = useSearch(query, {
    enabled: open && query.trim().length >= 2,
    debounceMs: 300,
    limit: 24,
  });

  const results = useMemo(
    () => searchQuery.data ?? [],
    [searchQuery.data],
  );
  const loading = searchQuery.isFetching;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const grouped = useMemo(
    () => ({
      teams: results.filter((r) => r.type === "team"),
      players: results.filter((r) => r.type === "player"),
      leagues: results.filter((r) => r.type === "league"),
    }),
    [results],
  );

  const onSelect = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      setQuery("");
      router.push(hrefFor(result));
    },
    [router],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg [&>button]:hidden">
        <Command shouldFilter={false} className="bg-card text-card-foreground">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search teams, players, leagues…"
              className="flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                ESC
              </kbd>
            )}
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              {query.trim().length < 2
                ? "Type at least 2 characters"
                : "No results found"}
            </Command.Empty>

            {(
              [
                {
                  key: "teams",
                  heading: "Teams",
                  icon: Shirt,
                  items: grouped.teams,
                },
                {
                  key: "players",
                  heading: "Players",
                  icon: Users,
                  items: grouped.players,
                },
                {
                  key: "leagues",
                  heading: "Leagues",
                  icon: Trophy,
                  items: grouped.leagues,
                },
              ] as const
            ).map((group) =>
              group.items.length ? (
                <Command.Group
                  key={group.key}
                  heading={group.heading}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {group.items.map((item) => (
                    <Command.Item
                      key={`${item.type}-${item.id}`}
                      value={`${item.type}-${item.id}-${item.name}`}
                      onSelect={() => onSelect(item)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-secondary",
                      )}
                    >
                      <group.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {item.name}
                      </span>
                      {item.subtitle ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null,
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
