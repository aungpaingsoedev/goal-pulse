import "server-only";

import type { Fixture, League, Player, Standing, Team } from "@/types/football";
import {
  mapFixture,
  mapLeagueFromApi,
  mapLineup,
  mapPlayer,
  mapStanding,
  mapStatistics,
  mapTeamFromApi,
} from "@/lib/football/football-mappers";
import type {
  ApiFootballFixtureItem,
  ApiFootballLeagueItem,
  ApiFootballLineup,
  ApiFootballPlayerItem,
  ApiFootballResponse,
  ApiFootballStandingsItem,
  ApiFootballStatistics,
  ApiFootballTeamItem,
  ApiFootballTopScorerItem,
} from "@/lib/football/football-types";

export interface FootballClientOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class FootballClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: FootballClientOptions = {}) {
    const useMock = process.env.USE_MOCK_DATA === "true";
    const apiKey = options.apiKey ?? process.env.FOOTBALL_API_KEY ?? "";
    const baseUrl =
      options.baseUrl ??
      process.env.FOOTBALL_API_URL ??
      "https://v3.football.api-sports.io";

    if (!apiKey && !useMock) {
      throw new Error(
        "FOOTBALL_API_KEY is required when USE_MOCK_DATA is not true",
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(
    path: string,
    params: Record<string, string | number | undefined | null> = {},
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("FOOTBALL_API_KEY is missing");
    }

    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        "x-apisports-key": this.apiKey,
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(
        `Football API error ${response.status}: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as ApiFootballResponse<T>;

    if (data.errors) {
      const errors = data.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        throw new Error(`Football API errors: ${errors.join(", ")}`);
      }
      if (!Array.isArray(errors) && Object.keys(errors).length > 0) {
        throw new Error(
          `Football API errors: ${Object.values(errors).join(", ")}`,
        );
      }
    }

    return data.response;
  }

  async getLiveFixtures(): Promise<Fixture[]> {
    const items = await this.request<ApiFootballFixtureItem[]>("/fixtures", {
      live: "all",
    });
    return items.map(mapFixture);
  }

  async getFixturesByDate(date: string): Promise<Fixture[]> {
    const items = await this.request<ApiFootballFixtureItem[]>("/fixtures", {
      date,
    });
    return items.map(mapFixture);
  }

  async getFixtureById(id: number): Promise<Fixture | null> {
    const items = await this.request<ApiFootballFixtureItem[]>("/fixtures", {
      id,
    });
    return items[0] ? mapFixture(items[0]) : null;
  }

  async getLeagues(params: {
    country?: string;
    season?: number;
    current?: boolean;
  } = {}): Promise<League[]> {
    const items = await this.request<ApiFootballLeagueItem[]>("/leagues", {
      country: params.country,
      season: params.season,
      current: params.current ? "true" : undefined,
    });
    return items.map((item) => mapLeagueFromApi(item, params.season));
  }

  async getLeagueById(id: number, season?: number): Promise<League | null> {
    const items = await this.request<ApiFootballLeagueItem[]>("/leagues", {
      id,
      season,
    });
    return items[0] ? mapLeagueFromApi(items[0], season) : null;
  }

  async getStandings(leagueId: number, season: number): Promise<Standing[]> {
    const items = await this.request<ApiFootballStandingsItem[]>(
      "/standings",
      { league: leagueId, season },
    );
    const rows = items[0]?.league.standings?.[0] ?? [];
    return rows.map((row) => mapStanding(row, leagueId, season));
  }

  async getTeams(params: {
    league?: number;
    season?: number;
    search?: string;
    id?: number;
  } = {}): Promise<Team[]> {
    const items = await this.request<ApiFootballTeamItem[]>("/teams", {
      league: params.league,
      season: params.season,
      search: params.search,
      id: params.id,
    });
    return items.map(mapTeamFromApi);
  }

  async getTeamById(id: number): Promise<Team | null> {
    const teams = await this.getTeams({ id });
    return teams[0] ?? null;
  }

  async getPlayers(params: {
    team?: number;
    season?: number;
    search?: string;
    page?: number;
  } = {}): Promise<Player[]> {
    const items = await this.request<ApiFootballPlayerItem[]>("/players", {
      team: params.team,
      season: params.season,
      search: params.search,
      page: params.page,
    });
    return items.map(mapPlayer);
  }

  async getPlayerById(id: number, season?: number): Promise<Player | null> {
    const items = await this.request<ApiFootballPlayerItem[]>("/players", {
      id,
      season,
    });
    return items[0] ? mapPlayer(items[0]) : null;
  }

  async getHeadToHead(
    team1: number,
    team2: number,
    last = 10,
  ): Promise<Fixture[]> {
    const items = await this.request<ApiFootballFixtureItem[]>(
      "/fixtures/headtohead",
      { h2h: `${team1}-${team2}`, last },
    );
    return items.map(mapFixture);
  }

  async getFixtureEvents(fixtureId: number): Promise<Fixture["events"]> {
    const fixture = await this.getFixtureById(fixtureId);
    if (fixture?.events) return fixture.events;

    const items = await this.request<ApiFootballFixtureItem[]>("/fixtures", {
      id: fixtureId,
    });
    return items[0] ? mapFixture(items[0]).events : [];
  }

  async getFixtureStatistics(
    fixtureId: number,
  ): Promise<Fixture["statistics"]> {
    const items = await this.request<ApiFootballStatistics[]>(
      "/fixtures/statistics",
      { fixture: fixtureId },
    );
    return items.map(mapStatistics);
  }

  async getFixtureLineups(fixtureId: number): Promise<Fixture["lineups"]> {
    const items = await this.request<ApiFootballLineup[]>(
      "/fixtures/lineups",
      { fixture: fixtureId },
    );
    return items.map(mapLineup);
  }

  async getTopScorers(leagueId: number, season: number): Promise<Player[]> {
    const items = await this.request<ApiFootballTopScorerItem[]>(
      "/players/topscorers",
      { league: leagueId, season },
    );

    return items.map((item) =>
      mapPlayer({
        player: item.player,
        statistics: item.statistics.map((s) => ({
          team: s.team,
          games: {
            position: s.games.position,
            number: null,
          },
        })),
      }),
    );
  }
}
