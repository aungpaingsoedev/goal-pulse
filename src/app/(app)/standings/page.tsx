"use client";

import { useState } from "react";
import { EmptyState } from "@/components/football/EmptyState";
import { TableSkeleton } from "@/components/football/LoadingSkeleton";
import { StandingsTable } from "@/components/football/StandingsTable";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStandings } from "@/hooks/use-standings";
import { DEFAULT_SEASON, POPULAR_LEAGUES } from "@/lib/football/constants";

export default function StandingsPage() {
  const [leagueId, setLeagueId] = useState(39);
  const season = DEFAULT_SEASON;
  const standingsQuery = useStandings(leagueId, season);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Standings"
        description="Table race across the major European leagues."
        actions={
          <Select
            value={String(leagueId)}
            onValueChange={(v) => setLeagueId(Number(v))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="League" />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_LEAGUES.filter((l) => l.id !== 2).map((league) => (
                <SelectItem key={league.id} value={String(league.id)}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {standingsQuery.isLoading ? (
        <TableSkeleton rows={10} />
      ) : standingsQuery.isError ? (
        <EmptyState
          title="Couldn’t load standings"
          actionLabel="Retry"
          onAction={() => void standingsQuery.refetch()}
        />
      ) : !(standingsQuery.data?.length) ? (
        <EmptyState title="No standings for this league" />
      ) : (
        <StandingsTable standings={standingsQuery.data} />
      )}
    </div>
  );
}
