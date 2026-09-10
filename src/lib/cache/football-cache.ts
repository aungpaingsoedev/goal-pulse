import "server-only";

import { memoryCache } from "@/lib/cache/memory-cache";
import { getFootballService } from "@/lib/football";
import type { Fixture, League, Player, Standing, Team } from "@/types/football";

export const FOOTBALL_TTL = {
  live: 15_000,
  fixtures: 60_000,
  standings: 300_000,
  teams: 600_000,
  players: 600_000,
  leagues: 600_000,
} as const;

function cacheGetOrSet<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = memoryCache.get<T>(key);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  return fetcher().then((value) => {
    memoryCache.set(key, value, ttlMs);
    return value;
  });
}

export function getCachedLiveFixtures(): Promise<Fixture[]> {
  return cacheGetOrSet("football:live", FOOTBALL_TTL.live, () =>
    getFootballService().getLiveFixtures(),
  );
}

export function getCachedFixturesByDate(date: string): Promise<Fixture[]> {
  return cacheGetOrSet(`football:fixtures:${date}`, FOOTBALL_TTL.fixtures, () =>
    getFootballService().getFixturesByDate(date),
  );
}

export function getCachedFixtureById(id: number): Promise<Fixture | null> {
  return cacheGetOrSet(`football:fixture:${id}`, FOOTBALL_TTL.fixtures, () =>
    getFootballService().getFixtureById(id),
  );
}

export function getCachedStandings(
  leagueId: number,
  season: number,
): Promise<Standing[]> {
  return cacheGetOrSet(
    `football:standings:${leagueId}:${season}`,
    FOOTBALL_TTL.standings,
    () => getFootballService().getStandings(leagueId, season),
  );
}

export function getCachedTeams(params: {
  league?: number;
  season?: number;
  search?: string;
  id?: number;
} = {}): Promise<Team[]> {
  const key = `football:teams:${JSON.stringify(params)}`;
  return cacheGetOrSet(key, FOOTBALL_TTL.teams, () =>
    getFootballService().getTeams(params),
  );
}

export function getCachedTeamById(id: number): Promise<Team | null> {
  return cacheGetOrSet(`football:team:${id}`, FOOTBALL_TTL.teams, () =>
    getFootballService().getTeamById(id),
  );
}

export function getCachedLeagues(params: {
  country?: string;
  season?: number;
  current?: boolean;
} = {}): Promise<League[]> {
  const key = `football:leagues:${JSON.stringify(params)}`;
  return cacheGetOrSet(key, FOOTBALL_TTL.leagues, () =>
    getFootballService().getLeagues(params),
  );
}

export function getCachedLeagueById(
  id: number,
  season?: number,
): Promise<League | null> {
  return cacheGetOrSet(
    `football:league:${id}:${season ?? "current"}`,
    FOOTBALL_TTL.leagues,
    () => getFootballService().getLeagueById(id, season),
  );
}

export function getCachedPlayers(params: {
  team?: number;
  season?: number;
  search?: string;
  page?: number;
} = {}): Promise<Player[]> {
  const key = `football:players:${JSON.stringify(params)}`;
  return cacheGetOrSet(key, FOOTBALL_TTL.players, () =>
    getFootballService().getPlayers(params),
  );
}

export function getCachedPlayerById(
  id: number,
  season?: number,
): Promise<Player | null> {
  return cacheGetOrSet(
    `football:player:${id}:${season ?? "current"}`,
    FOOTBALL_TTL.players,
    () => getFootballService().getPlayerById(id, season),
  );
}

export function invalidateFootballCache(pattern?: string): void {
  memoryCache.invalidate(pattern ?? "football:*");
}
