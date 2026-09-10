"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Activity, CalendarDays, Trophy } from "lucide-react";
import { LiveMatchCard } from "@/components/football/LiveMatchCard";
import { MatchCard } from "@/components/football/MatchCard";
import { LeagueCard } from "@/components/football/LeagueCard";
import { TeamCard } from "@/components/football/TeamCard";
import { EmptyState } from "@/components/football/EmptyState";
import {
  LeagueCardSkeleton,
  MatchCardSkeleton,
  TeamCardSkeleton,
} from "@/components/football/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLiveMatches } from "@/hooks/use-live-matches";
import { useFixtures } from "@/hooks/use-fixtures";
import { useLeagues } from "@/hooks/use-league";
import { useTeams } from "@/hooks/use-team";
import { useFavorites } from "@/hooks/use-favorites";
import { POPULAR_LEAGUE_IDS } from "@/lib/football/constants";
import {
  greetingForHour,
  isUpcomingStatus,
  toDateKey,
} from "@/lib/football/fixture-utils";

function SectionTitle({
  title,
  href,
  action,
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {href ? (
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
          <Link href={href}>{action ?? "View all"}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function DashboardContent() {
  const router = useRouter();
  const now = new Date();
  const todayKey = toDateKey(now);
  const greeting = greetingForHour(now.getHours());

  const liveQuery = useLiveMatches();
  const fixturesQuery = useFixtures({ date: todayKey });
  const leaguesQuery = useLeagues({ current: true });
  const favoritesQuery = useFavorites();
  const teamsQuery = useTeams({ league: 39, season: now.getFullYear() });

  const live = liveQuery.data ?? [];
  const todays = useMemo(
    () => fixturesQuery.data ?? [],
    [fixturesQuery.data],
  );
  const upcoming = useMemo(
    () => todays.filter((f) => isUpcomingStatus(f.status)).slice(0, 6),
    [todays],
  );

  const popularLeagues = useMemo(() => {
    const leagues = leaguesQuery.data ?? [];
    const popular = leagues.filter((l) =>
      (POPULAR_LEAGUE_IDS as readonly number[]).includes(l.id),
    );
    return popular.length ? popular : leagues.slice(0, 6);
  }, [leaguesQuery.data]);

  const favoriteTeamIds = useMemo(
    () =>
      (favoritesQuery.data ?? [])
        .filter((f) => f.type === "team")
        .map((f) => f.entityId),
    [favoritesQuery.data],
  );

  const favoriteTeams = useMemo(() => {
    const teams = teamsQuery.data ?? [];
    if (!favoriteTeamIds.length) return teams.slice(0, 6);
    const matched = teams.filter((t) => favoriteTeamIds.includes(t.id));
    return matched.length ? matched : teams.slice(0, 6);
  }, [teamsQuery.data, favoriteTeamIds]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {format(now, "EEEE, d MMMM yyyy")}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening in football today.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="live" className="gap-1.5 px-2.5 py-1">
            <Activity className="h-3 w-3" />
            {liveQuery.isLoading ? "…" : live.length} live
          </Badge>
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
            <CalendarDays className="h-3 w-3" />
            {fixturesQuery.isLoading ? "…" : todays.length} today
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
            <Trophy className="h-3 w-3" />
            {leaguesQuery.isLoading ? "…" : popularLeagues.length} leagues
          </Badge>
        </div>
      </header>

      <section>
        <SectionTitle title="Live now" href="/live" />
        {liveQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        ) : liveQuery.isError ? (
          <EmptyState
            title="Couldn’t load live matches"
            description="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => void liveQuery.refetch()}
          />
        ) : live.length === 0 ? (
          <EmptyState
            title="No live matches"
            description="Check upcoming kickoffs or browse today’s fixtures."
            actionLabel="View matches"
            onAction={() => router.push("/matches")}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {live.slice(0, 4).map((fixture) => (
              <LiveMatchCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle
          title={favoriteTeamIds.length ? "My teams" : "Favorite teams"}
          href="/favorites"
        />
        {teamsQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <TeamCardSkeleton />
            <TeamCardSkeleton />
            <TeamCardSkeleton />
          </div>
        ) : favoriteTeams.length === 0 ? (
          <EmptyState
            title="No teams yet"
            description="Browse clubs and star the ones you follow."
            actionLabel="Browse teams"
            onAction={() => router.push("/teams")}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle title="Today’s matches" href="/matches" />
        {fixturesQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        ) : fixturesQuery.isError ? (
          <EmptyState
            title="Couldn’t load fixtures"
            actionLabel="Retry"
            onAction={() => void fixturesQuery.refetch()}
          />
        ) : todays.length === 0 ? (
          <EmptyState
            title="No matches today"
            description="Pick another date on the matches page."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {todays.slice(0, 6).map((fixture) => (
              <MatchCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle title="Upcoming" href="/matches" />
        {upcoming.length === 0 && !fixturesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">
            No more kickoffs scheduled for today.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((fixture) => (
              <MatchCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle title="Popular leagues" href="/leagues" />
        {leaguesQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <LeagueCardSkeleton />
            <LeagueCardSkeleton />
            <LeagueCardSkeleton />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularLeagues.map((league) => (
              <LeagueCard key={league.id} league={league} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
