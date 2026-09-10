import "server-only";

import type { Fixture, League, Player, Standing, Team } from "@/types/football";
import type {
  SportmonksFixture,
  SportmonksLeague,
  SportmonksPlayer,
  SportmonksResponse,
  SportmonksSeason,
  SportmonksStanding,
  SportmonksTeam,
  SportmonksTopscorer,
  SportmonksTvStation,
} from "@/lib/football/football-types";
import {
  getFixtureStreams,
  looksLikeCalendarYear,
  mapFixture,
  mapLeagueFromSportmonks,
  mapPlayer,
  mapStanding,
  mapTeamFromSportmonks,
  mapTopscorer,
  mapTvStation,
  parseSeasonYear,
} from "@/lib/football/football-mappers";

export interface FootballClientOptions {
  apiKey?: string;
  baseUrl?: string;
}

const LIVE_INCLUDE =
  "participants;scores;league;state;events;periods;tvStations.tvstation";
const DATE_INCLUDE = "participants;scores;league;state;periods";
const FIXTURE_INCLUDE =
  "participants;scores;league;state;events;statistics;lineups.player;periods;tvStations.tvstation;venue";

/**
 * Resolves the Sportmonks API token.
 * Prefers SPORTMONKS_API_TOKEN; FOOTBALL_API_KEY is a deprecated alias.
 */
export function resolveFootballApiToken(explicit?: string): string {
  return (
    explicit ??
    process.env.SPORTMONKS_API_TOKEN ??
    process.env.FOOTBALL_API_KEY ??
    ""
  );
}

export function hasFootballApiToken(): boolean {
  return Boolean(resolveFootballApiToken());
}

/**
 * Sportmonks Football API v3 client.
 * Kept as `FootballClient` so the rest of the app can keep importing the same name.
 */
export class FootballClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  /** Cache leagueId+year → seasonId to avoid repeated lookups */
  private readonly seasonIdCache = new Map<string, number>();

  constructor(options: FootballClientOptions = {}) {
    const useMock = process.env.USE_MOCK_DATA === "true";
    const apiKey = resolveFootballApiToken(options.apiKey);
    const baseUrl =
      options.baseUrl ??
      process.env.SPORTMONKS_API_URL ??
      process.env.FOOTBALL_API_URL ??
      "https://api.sportmonks.com/v3/football";

    if (!apiKey && !useMock) {
      throw new Error(
        "SPORTMONKS_API_TOKEN (or deprecated FOOTBALL_API_KEY) is required when USE_MOCK_DATA is not true",
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
      throw new Error(
        "SPORTMONKS_API_TOKEN (or deprecated FOOTBALL_API_KEY) is missing",
      );
    }

    const url = new URL(
      `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`,
    );
    // Sportmonks' most compatible auth: api_token query param
    url.searchParams.set("api_token", this.apiKey);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      if (response.status === 401) {
        throw new Error(
          `Sportmonks rejected the API token (401). Verify SPORTMONKS_API_TOKEN at my.sportmonks.com, or set USE_MOCK_DATA=true for local demo.${
            body ? ` — ${body.slice(0, 200)}` : ""
          }`,
        );
      }
      throw new Error(
        `Sportmonks API error ${response.status}: ${response.statusText}${
          body ? ` — ${body.slice(0, 200)}` : ""
        }`,
      );
    }

    const json = (await response.json()) as SportmonksResponse<T>;

    if (json.errors) {
      const errors = json.errors;
      if (typeof errors === "string" && errors.length > 0) {
        throw new Error(`Sportmonks API errors: ${errors}`);
      }
      if (Array.isArray(errors) && errors.length > 0) {
        throw new Error(`Sportmonks API errors: ${errors.join(", ")}`);
      }
      if (
        !Array.isArray(errors) &&
        typeof errors === "object" &&
        Object.keys(errors).length > 0
      ) {
        throw new Error(`Sportmonks API errors: ${JSON.stringify(errors)}`);
      }
    }

    return json.data;
  }

  private asArray<T>(data: T | T[] | null | undefined): T[] {
    if (data == null) return [];
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Sportmonks standings & topscorers require a season *ID* (e.g. 19735), not a year.
   * - If `season` is outside calendar-year range, treat it as a season ID.
   * - If it looks like a year (1990–2100), resolve via the league's seasons / currentSeason.
   */
  async resolveSeasonId(leagueId: number, season: number): Promise<number> {
    if (!looksLikeCalendarYear(season)) {
      return season;
    }

    const cacheKey = `${leagueId}:${season}`;
    const cached = this.seasonIdCache.get(cacheKey);
    if (cached) return cached;

    const league = await this.request<SportmonksLeague>(
      `/leagues/${leagueId}`,
      { include: "currentSeason;seasons" },
    );

    const seasons: SportmonksSeason[] = [
      ...(league.seasons ?? []),
      ...(league.currentSeason ? [league.currentSeason] : []),
      ...(league.current_season ? [league.current_season] : []),
    ];

    const byYear = seasons.find((s) => {
      if (!s.name) return false;
      const year = parseSeasonYear(s.name);
      return year === season;
    });

    if (byYear?.id) {
      this.seasonIdCache.set(cacheKey, byYear.id);
      return byYear.id;
    }

    const current = league.currentSeason ?? league.current_season;
    if (current?.id) {
      this.seasonIdCache.set(cacheKey, current.id);
      return current.id;
    }

    return season;
  }

  async getLiveFixtures(): Promise<Fixture[]> {
    const data = await this.request<SportmonksFixture[]>(
      "/livescores/inplay",
      { include: LIVE_INCLUDE },
    );
    return this.asArray(data).map(mapFixture);
  }

  async getFixturesByDate(date: string): Promise<Fixture[]> {
    const data = await this.request<SportmonksFixture[]>(
      `/fixtures/date/${date}`,
      { include: DATE_INCLUDE },
    );
    return this.asArray(data).map(mapFixture);
  }

  async getFixtureById(id: number): Promise<Fixture | null> {
    try {
      const data = await this.request<SportmonksFixture>(`/fixtures/${id}`, {
        include: FIXTURE_INCLUDE,
      });
      if (!data) return null;
      return mapFixture(Array.isArray(data) ? data[0] : data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("404")) return null;
      throw err;
    }
  }

  async getLeagues(
    params: {
      country?: string;
      season?: number;
      current?: boolean;
    } = {},
  ): Promise<League[]> {
    const data = await this.request<SportmonksLeague[]>("/leagues", {
      include: "country;currentSeason",
    });
    let leagues = this.asArray(data).map((item) =>
      mapLeagueFromSportmonks(item, params.season),
    );

    if (params.country) {
      const q = params.country.toLowerCase();
      leagues = leagues.filter((l) => l.country.toLowerCase() === q);
    }
    void params.current;
    return leagues;
  }

  async getLeagueById(id: number, season?: number): Promise<League | null> {
    try {
      const data = await this.request<SportmonksLeague>(`/leagues/${id}`, {
        include: "country;currentSeason",
      });
      if (!data) return null;
      const league = Array.isArray(data) ? data[0] : data;
      return league ? mapLeagueFromSportmonks(league, season) : null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("404")) return null;
      throw err;
    }
  }

  async getStandings(leagueId: number, season: number): Promise<Standing[]> {
    const seasonId = await this.resolveSeasonId(leagueId, season);
    const data = await this.request<SportmonksStanding[]>(
      `/standings/seasons/${seasonId}`,
      { include: "participant;details.type;form;rule.type" },
    );
    return this.asArray(data).map((row) =>
      mapStanding(row, leagueId, seasonId),
    );
  }

  async getTeams(
    params: {
      league?: number;
      season?: number;
      search?: string;
      id?: number;
    } = {},
  ): Promise<Team[]> {
    if (params.id != null) {
      const team = await this.getTeamById(params.id);
      return team ? [team] : [];
    }

    if (params.search) {
      const data = await this.request<SportmonksTeam[]>(
        `/teams/search/${encodeURIComponent(params.search)}`,
      );
      return this.asArray(data).map(mapTeamFromSportmonks);
    }

    if (params.league != null) {
      try {
        const seasonId =
          params.season != null
            ? await this.resolveSeasonId(params.league, params.season)
            : undefined;
        if (seasonId) {
          const data = await this.request<SportmonksTeam[]>(
            `/teams/seasons/${seasonId}`,
          );
          return this.asArray(data).map(mapTeamFromSportmonks);
        }
      } catch {
        // Endpoint may not be available on all plans
      }
    }

    return [];
  }

  async getTeamById(id: number): Promise<Team | null> {
    try {
      const data = await this.request<SportmonksTeam>(`/teams/${id}`, {
        include: "country;venue",
      });
      if (!data) return null;
      const team = Array.isArray(data) ? data[0] : data;
      return team ? mapTeamFromSportmonks(team) : null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("404")) return null;
      throw err;
    }
  }

  async getPlayers(
    params: {
      team?: number;
      season?: number;
      search?: string;
      page?: number;
    } = {},
  ): Promise<Player[]> {
    if (params.search) {
      const data = await this.request<SportmonksPlayer[]>(
        `/players/search/${encodeURIComponent(params.search)}`,
        { page: params.page },
      );
      return this.asArray(data).map(mapPlayer);
    }

    if (params.team != null) {
      try {
        const data = await this.request<SportmonksTeam>(
          `/teams/${params.team}`,
          { include: "players" },
        );
        const team = Array.isArray(data) ? data[0] : data;
        return (team?.players ?? []).map(mapPlayer);
      } catch {
        return [];
      }
    }

    return [];
  }

  async getPlayerById(id: number, _season?: number): Promise<Player | null> {
    void _season;
    try {
      const data = await this.request<SportmonksPlayer>(`/players/${id}`, {
        include: "nationality;position;teams",
      });
      if (!data) return null;
      const player = Array.isArray(data) ? data[0] : data;
      return player ? mapPlayer(player) : null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("404")) return null;
      throw err;
    }
  }

  async getHeadToHead(
    team1: number,
    team2: number,
    last = 10,
  ): Promise<Fixture[]> {
    const data = await this.request<SportmonksFixture[]>(
      `/fixtures/head-to-head/${team1}/${team2}`,
      { include: DATE_INCLUDE },
    );
    return this.asArray(data).map(mapFixture).slice(0, last);
  }

  async getFixtureEvents(fixtureId: number): Promise<Fixture["events"]> {
    const fixture = await this.getFixtureById(fixtureId);
    return fixture?.events ?? [];
  }

  async getFixtureStatistics(
    fixtureId: number,
  ): Promise<Fixture["statistics"]> {
    const fixture = await this.getFixtureById(fixtureId);
    return fixture?.statistics ?? [];
  }

  async getFixtureLineups(fixtureId: number): Promise<Fixture["lineups"]> {
    const fixture = await this.getFixtureById(fixtureId);
    return fixture?.lineups ?? [];
  }

  async getFixtureStreams(fixtureId: number): Promise<Fixture["streams"]> {
    const fixture = await this.getFixtureById(fixtureId);
    const fromFixture = fixture ? getFixtureStreams(fixture) : [];
    if (fromFixture.length) return fromFixture;

    try {
      const data = await this.request<SportmonksTvStation[]>(
        `/tv-stations/fixtures/${fixtureId}`,
      );
      return this.asArray(data).map(mapTvStation);
    } catch {
      return [];
    }
  }

  /**
   * @param leagueId Used to resolve calendar years → Sportmonks season IDs.
   * @param season Calendar year OR Sportmonks season ID (see resolveSeasonId).
   */
  async getTopScorers(leagueId: number, season: number): Promise<Player[]> {
    const seasonId = await this.resolveSeasonId(leagueId, season);
    const data = await this.request<SportmonksTopscorer[]>(
      `/topscorers/seasons/${seasonId}`,
      { include: "player;participant" },
    );
    return this.asArray(data).map(mapTopscorer);
  }
}

/** Alias for clarity in new code */
export { FootballClient as SportmonksClient };
