/** Raw shapes returned by the API-Football / API-SPORTS football API. */

export interface ApiFootballPaging {
  current: number;
  total: number;
}

export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, string | number>;
  errors: Record<string, string> | string[];
  results: number;
  paging: ApiFootballPaging;
  response: T;
}

export interface ApiFootballTeamRef {
  id: number;
  name: string;
  logo: string;
  winner?: boolean | null;
}

export interface ApiFootballLeagueRef {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round?: string | null;
  standings?: ApiFootballStandingRow[][];
}

export interface ApiFootballStatus {
  long: string;
  short: string;
  elapsed: number | null;
  extra?: number | null;
}

export interface ApiFootballGoals {
  home: number | null;
  away: number | null;
}

export interface ApiFootballScore {
  halftime: ApiFootballGoals;
  fulltime: ApiFootballGoals;
  extratime: ApiFootballGoals;
  penalty: ApiFootballGoals;
}

export interface ApiFootballFixtureCore {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: {
    id: number | null;
    name: string | null;
    city: string | null;
  };
  status: ApiFootballStatus;
}

export interface ApiFootballFixtureItem {
  fixture: ApiFootballFixtureCore;
  league: ApiFootballLeagueRef;
  teams: {
    home: ApiFootballTeamRef;
    away: ApiFootballTeamRef;
  };
  goals: ApiFootballGoals;
  score: ApiFootballScore;
  events?: ApiFootballEvent[];
  statistics?: ApiFootballStatistics[];
  lineups?: ApiFootballLineup[];
  players?: unknown[];
}

export interface ApiFootballEvent {
  time: {
    elapsed: number | null;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number | null;
    name: string | null;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

export interface ApiFootballStatistics {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

export interface ApiFootballLineupPlayer {
  player: {
    id: number;
    name: string;
    number: number | null;
    pos: string | null;
    grid: string | null;
  };
}

export interface ApiFootballLineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors?: unknown;
  };
  formation: string | null;
  startXI: ApiFootballLineupPlayer[];
  substitutes: ApiFootballLineupPlayer[];
  coach: {
    id: number | null;
    name: string | null;
    photo: string | null;
  };
}

export interface ApiFootballStandingRow {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  status: string | null;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
  update: string;
}

export interface ApiFootballStandingsItem {
  league: ApiFootballLeagueRef;
}

export interface ApiFootballLeagueItem {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string | null;
    flag: string | null;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
  }>;
}

export interface ApiFootballTeamItem {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string;
    founded: number | null;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number | null;
    name: string | null;
    address: string | null;
    city: string | null;
    capacity: number | null;
    surface: string | null;
    image: string | null;
  };
}

export interface ApiFootballPlayerItem {
  player: {
    id: number;
    name: string;
    firstname: string | null;
    lastname: string | null;
    age: number | null;
    birth?: {
      date: string | null;
      place: string | null;
      country: string | null;
    };
    nationality: string | null;
    height: string | null;
    weight: string | null;
    injured?: boolean;
    photo: string;
  };
  statistics?: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    games?: {
      position: string | null;
      number?: number | null;
    };
  }>;
}

export interface ApiFootballTopScorerItem {
  player: ApiFootballPlayerItem["player"];
  statistics: Array<{
    team: { id: number; name: string; logo: string };
    goals: { total: number | null; assists: number | null };
    games: { appearances: number | null; position: string | null };
  }>;
}
