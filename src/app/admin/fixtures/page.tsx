"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DateSelector } from "@/components/football/DateSelector";
import { MatchCard } from "@/components/football/MatchCard";
import { EmptyState } from "@/components/football/EmptyState";
import { MatchCardSkeleton } from "@/components/football/LoadingSkeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useFixtures } from "@/hooks/use-fixtures";
import { toDateKey } from "@/lib/football/fixture-utils";

export default function AdminFixturesPage() {
  const [date, setDate] = useState(() => new Date());
  const fixturesQuery = useFixtures({ date: toDateKey(date) });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fixtures"
        description={`Browse cached fixtures · ${format(date, "yyyy-MM-dd")}`}
      />
      <DateSelector value={date} onChange={setDate} />
      {fixturesQuery.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      ) : fixturesQuery.isError ? (
        <EmptyState
          title="Couldn’t load fixtures"
          actionLabel="Retry"
          onAction={() => void fixturesQuery.refetch()}
        />
      ) : !(fixturesQuery.data?.length) ? (
        <EmptyState title="No fixtures for this date" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {fixturesQuery.data.map((f) => (
            <MatchCard key={f.id} fixture={f} />
          ))}
        </div>
      )}
    </div>
  );
}
