import "server-only";

import { FootballClient } from "@/lib/football/football-client";
import { MockFootballClient } from "@/lib/football/mock-data";
import type {
  Fixture,
  League,
  Player,
  Standing,
  Team,
} from "@/types/football";

export interface FootballService {
  getLiveFixtures(): Promise<Fixture[]>;
  getFixturesByDate(date: string): Promise<Fixture[]>;
  getFixtureById(id: number): Promise<Fixture | null>;
  getLeagues(params?: {
    country?: string;
    season?: number;
    current?: boolean;
  }): Promise<League[]>;
  getLeagueById(id: number, season?: number): Promise<League | null>;
  getStandings(leagueId: number, season: number): Promise<Standing[]>;
  getTeams(params?: {
    league?: number;
    season?: number;
    search?: string;
    id?: number;
  }): Promise<Team[]>;
  getTeamById(id: number): Promise<Team | null>;
  getPlayers(params?: {
    team?: number;
    season?: number;
    search?: string;
    page?: number;
  }): Promise<Player[]>;
  getPlayerById(id: number, season?: number): Promise<Player | null>;
  getHeadToHead(
    team1: number,
    team2: number,
    last?: number,
  ): Promise<Fixture[]>;
  getFixtureEvents(fixtureId: number): Promise<Fixture["events"]>;
  getFixtureStatistics(fixtureId: number): Promise<Fixture["statistics"]>;
  getFixtureLineups(fixtureId: number): Promise<Fixture["lineups"]>;
  getTopScorers(leagueId: number, season: number): Promise<Player[]>;
}

let cachedService: FootballService | null = null;

export function shouldUseMockData(): boolean {
  if (process.env.USE_MOCK_DATA === "true") return true;
  if (process.env.USE_MOCK_DATA === "false") return false;
  return !process.env.FOOTBALL_API_KEY;
}

export function getFootballService(): FootballService {
  if (cachedService) return cachedService;

  if (shouldUseMockData()) {
    cachedService = new MockFootballClient();
  } else {
    cachedService = new FootballClient();
  }

  return cachedService;
}

export function resetFootballService(): void {
  cachedService = null;
}

export type { FootballClient };
export { MockFootballClient } from "@/lib/football/mock-data";
export * from "@/lib/football/football-mappers";
export type * from "@/lib/football/football-types";
