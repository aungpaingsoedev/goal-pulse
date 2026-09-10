export type FixtureStatus =
  | "TBD"
  | "NS"
  | "1H"
  | "HT"
  | "2H"
  | "ET"
  | "BT"
  | "P"
  | "SUSP"
  | "INT"
  | "FT"
  | "AET"
  | "PEN"
  | "PST"
  | "CANC"
  | "ABD"
  | "AWD"
  | "WO"
  | "LIVE";

export type MatchEventType = "Goal" | "Card" | "subst" | "Var";

export interface MatchEvent {
  id: string;
  time: {
    elapsed: number;
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
  type: MatchEventType;
  detail: string;
  comments: string | null;
}

export interface StatisticItem {
  type: string;
  value: number | string | null;
}

export interface MatchStatistics {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: StatisticItem[];
}

export interface Venue {
  id: number | null;
  name: string | null;
  city: string | null;
  address?: string | null;
  capacity?: number | null;
  surface?: string | null;
  image?: string | null;
}

export interface Team {
  id: number;
  name: string;
  code: string | null;
  country: string | null;
  founded: number | null;
  national: boolean;
  logo: string;
  venue?: Venue | null;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round: string | null;
  type?: string | null;
}

export interface Player {
  id: number;
  name: string;
  firstname: string | null;
  lastname: string | null;
  age: number | null;
  nationality: string | null;
  height: string | null;
  weight: string | null;
  photo: string;
  position: string | null;
  number: number | null;
  team?: Pick<Team, "id" | "name" | "logo"> | null;
}

export interface ScorePair {
  home: number | null;
  away: number | null;
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number | null;
  pos: string | null;
  grid: string | null;
  photo?: string;
}

export interface FixtureLineup {
  team: Pick<Team, "id" | "name" | "logo">;
  formation: string | null;
  coach: {
    id: number | null;
    name: string | null;
    photo: string | null;
  };
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface MatchStream {
  id: number | string;
  name: string;
  url: string | null;
  type: "tv" | "stream" | "highlight" | "other";
  country?: string | null;
  logo?: string | null;
}

export interface Fixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  venue: Venue;
  status: FixtureStatus;
  elapsed: number | null;
  league: League;
  home: Team & { winner: boolean | null };
  away: Team & { winner: boolean | null };
  goals: ScorePair;
  score: {
    halftime: ScorePair;
    fulltime: ScorePair;
    extratime: ScorePair;
    penalty: ScorePair;
  };
  events?: MatchEvent[];
  statistics?: MatchStatistics[];
  lineups?: FixtureLineup[];
  streams?: MatchStream[];
}

export interface StandingRecord {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
}

export interface Standing {
  rank: number;
  team: Pick<Team, "id" | "name" | "logo">;
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  status: string | null;
  description: string | null;
  all: StandingRecord;
  home: StandingRecord;
  away: StandingRecord;
  update: string;
  leagueId: number;
  season: number;
}

export type SearchResultType = "team" | "league" | "player" | "fixture";

export interface SearchResult {
  type: SearchResultType;
  id: number;
  name: string;
  subtitle?: string;
  image?: string;
  meta?: Record<string, string | number | null>;
}

export type FavoriteType = "team" | "league" | "fixture" | "player";

export interface NotificationPrefs {
  goals: boolean;
  cards: boolean;
  kickoff: boolean;
  finalWhistle: boolean;
  lineups: boolean;
  substitutions: boolean;
}

export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  notificationPrefs: NotificationPrefs;
  createdAt: string;
  updatedAt: string;
}

export interface LiveFixtureGroup {
  league: League;
  fixtures: Fixture[];
}

export interface Favorite {
  id: string;
  userId: string;
  type: FavoriteType;
  entityId: number;
  createdAt: string;
}

export type NotificationType =
  | "info"
  | "goal"
  | "card"
  | "kickoff"
  | "final"
  | "lineup"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType | string;
  read: boolean;
  createdAt: string;
  meta?: Record<string, string | number | null>;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  goals: true,
  cards: false,
  kickoff: true,
  finalWhistle: true,
  lineups: true,
  substitutions: false,
};

export const LIVE_STATUSES: FixtureStatus[] = [
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "LIVE",
  "INT",
  "SUSP",
];

export const FINISHED_STATUSES: FixtureStatus[] = [
  "FT",
  "AET",
  "PEN",
  "AWD",
  "WO",
];
