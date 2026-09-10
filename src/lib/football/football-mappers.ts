import type {
  Fixture,
  FixtureLineup,
  FixtureStatus,
  League,
  MatchEvent,
  MatchEventType,
  MatchStatistics,
  Player,
  Standing,
  Team,
} from "@/types/football";
import type {
  ApiFootballEvent,
  ApiFootballFixtureItem,
  ApiFootballLeagueItem,
  ApiFootballLineup,
  ApiFootballPlayerItem,
  ApiFootballStandingRow,
  ApiFootballStatistics,
  ApiFootballTeamItem,
} from "@/lib/football/football-types";

const VALID_STATUSES = new Set<FixtureStatus>([
  "TBD",
  "NS",
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "SUSP",
  "INT",
  "FT",
  "AET",
  "PEN",
  "PST",
  "CANC",
  "ABD",
  "AWD",
  "WO",
  "LIVE",
]);

function mapStatus(short: string): FixtureStatus {
  if (VALID_STATUSES.has(short as FixtureStatus)) {
    return short as FixtureStatus;
  }
  return "NS";
}

function mapEventType(type: string): MatchEventType {
  if (type === "Goal" || type === "Card" || type === "subst" || type === "Var") {
    return type;
  }
  return "Var";
}

export function mapTeamFromApi(item: ApiFootballTeamItem): Team {
  return {
    id: item.team.id,
    name: item.team.name,
    code: item.team.code,
    country: item.team.country,
    founded: item.team.founded,
    national: item.team.national,
    logo: item.team.logo,
    venue: {
      id: item.venue.id,
      name: item.venue.name,
      city: item.venue.city,
      address: item.venue.address,
      capacity: item.venue.capacity,
      surface: item.venue.surface,
      image: item.venue.image,
    },
  };
}

export function mapTeamRef(
  team: { id: number; name: string; logo: string },
  extras?: Partial<Team>,
): Team {
  return {
    id: team.id,
    name: team.name,
    code: extras?.code ?? null,
    country: extras?.country ?? null,
    founded: extras?.founded ?? null,
    national: extras?.national ?? false,
    logo: team.logo,
    venue: extras?.venue ?? null,
  };
}

export function mapLeagueFromApi(
  item: ApiFootballLeagueItem,
  season?: number,
): League {
  const current =
    item.seasons.find((s) => s.current) ??
    item.seasons[item.seasons.length - 1];

  return {
    id: item.league.id,
    name: item.league.name,
    country: item.country.name,
    logo: item.league.logo,
    flag: item.country.flag,
    season: season ?? current?.year ?? new Date().getFullYear(),
    round: null,
    type: item.league.type,
  };
}

export function mapEvent(event: ApiFootballEvent, index: number): MatchEvent {
  return {
    id: `${event.team.id}-${event.time.elapsed ?? 0}-${index}-${event.type}`,
    time: {
      elapsed: event.time.elapsed ?? 0,
      extra: event.time.extra,
    },
    team: {
      id: event.team.id,
      name: event.team.name,
      logo: event.team.logo,
    },
    player: {
      id: event.player.id,
      name: event.player.name,
    },
    assist: {
      id: event.assist.id,
      name: event.assist.name,
    },
    type: mapEventType(event.type),
    detail: event.detail,
    comments: event.comments,
  };
}

export function mapStatistics(stats: ApiFootballStatistics): MatchStatistics {
  return {
    team: {
      id: stats.team.id,
      name: stats.team.name,
      logo: stats.team.logo,
    },
    statistics: stats.statistics.map((s) => ({
      type: s.type,
      value: s.value,
    })),
  };
}

export function mapLineup(lineup: ApiFootballLineup): FixtureLineup {
  return {
    team: {
      id: lineup.team.id,
      name: lineup.team.name,
      logo: lineup.team.logo,
    },
    formation: lineup.formation,
    coach: {
      id: lineup.coach.id,
      name: lineup.coach.name,
      photo: lineup.coach.photo,
    },
    startXI: lineup.startXI.map((row) => ({
      id: row.player.id,
      name: row.player.name,
      number: row.player.number,
      pos: row.player.pos,
      grid: row.player.grid,
    })),
    substitutes: lineup.substitutes.map((row) => ({
      id: row.player.id,
      name: row.player.name,
      number: row.player.number,
      pos: row.player.pos,
      grid: row.player.grid,
    })),
  };
}

export function mapFixture(item: ApiFootballFixtureItem): Fixture {
  return {
    id: item.fixture.id,
    referee: item.fixture.referee,
    timezone: item.fixture.timezone,
    date: item.fixture.date,
    timestamp: item.fixture.timestamp,
    venue: {
      id: item.fixture.venue.id,
      name: item.fixture.venue.name,
      city: item.fixture.venue.city,
    },
    status: mapStatus(item.fixture.status.short),
    elapsed: item.fixture.status.elapsed,
    league: {
      id: item.league.id,
      name: item.league.name,
      country: item.league.country,
      logo: item.league.logo,
      flag: item.league.flag,
      season: item.league.season,
      round: item.league.round ?? null,
    },
    home: {
      ...mapTeamRef(item.teams.home),
      winner: item.teams.home.winner ?? null,
    },
    away: {
      ...mapTeamRef(item.teams.away),
      winner: item.teams.away.winner ?? null,
    },
    goals: {
      home: item.goals.home,
      away: item.goals.away,
    },
    score: {
      halftime: { ...item.score.halftime },
      fulltime: { ...item.score.fulltime },
      extratime: { ...item.score.extratime },
      penalty: { ...item.score.penalty },
    },
    events: item.events?.map(mapEvent),
    statistics: item.statistics?.map(mapStatistics),
    lineups: item.lineups?.map(mapLineup),
  };
}

export function mapStanding(
  row: ApiFootballStandingRow,
  leagueId: number,
  season: number,
): Standing {
  return {
    rank: row.rank,
    team: {
      id: row.team.id,
      name: row.team.name,
      logo: row.team.logo,
    },
    points: row.points,
    goalsDiff: row.goalsDiff,
    group: row.group,
    form: row.form,
    status: row.status,
    description: row.description,
    all: row.all,
    home: row.home,
    away: row.away,
    update: row.update,
    leagueId,
    season,
  };
}

export function mapPlayer(item: ApiFootballPlayerItem): Player {
  const stats = item.statistics?.[0];

  return {
    id: item.player.id,
    name: item.player.name,
    firstname: item.player.firstname,
    lastname: item.player.lastname,
    age: item.player.age,
    nationality: item.player.nationality,
    height: item.player.height,
    weight: item.player.weight,
    photo: item.player.photo,
    position: stats?.games?.position ?? null,
    number: stats?.games?.number ?? null,
    team: stats
      ? {
          id: stats.team.id,
          name: stats.team.name,
          logo: stats.team.logo,
        }
      : null,
  };
}
