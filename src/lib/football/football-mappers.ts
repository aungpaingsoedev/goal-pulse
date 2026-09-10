import type {
  Fixture,
  FixtureLineup,
  FixtureStatus,
  League,
  MatchEvent,
  MatchEventType,
  MatchStatistics,
  MatchStream,
  Player,
  ScorePair,
  Standing,
  StandingRecord,
  Team,
} from "@/types/football";
import type {
  SportmonksEvent,
  SportmonksFixture,
  SportmonksFixtureTvStation,
  SportmonksLeague,
  SportmonksLineup,
  SportmonksParticipant,
  SportmonksPlayer,
  SportmonksScore,
  SportmonksStanding,
  SportmonksStandingDetail,
  SportmonksState,
  SportmonksStatistic,
  SportmonksTeam,
  SportmonksTopscorer,
  SportmonksTvStation,
  SportmonksVenue,
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

/** Map Sportmonks state.developer_name / short_name / state → FixtureStatus */
const STATE_MAP: Record<string, FixtureStatus> = {
  NS: "NS",
  NOT_STARTED: "NS",
  TBD: "TBD",
  INPLAY_1ST_HALF: "1H",
  "1ST_HALF": "1H",
  "1H": "1H",
  HT: "HT",
  HALF_TIME: "HT",
  INPLAY_2ND_HALF: "2H",
  "2ND_HALF": "2H",
  "2H": "2H",
  BREAK: "BT",
  BT: "BT",
  INPLAY_ET: "ET",
  ET: "ET",
  EXTRA_TIME: "ET",
  AET: "AET",
  INPLAY_PENALTIES: "P",
  PENALTIES: "P",
  P: "P",
  FT_PEN: "PEN",
  PEN: "PEN",
  FT: "FT",
  FULL_TIME: "FT",
  POSTPONED: "PST",
  PST: "PST",
  CANCELLED: "CANC",
  CANCELED: "CANC",
  CANC: "CANC",
  ABANDONED: "ABD",
  ABD: "ABD",
  SUSPENDED: "SUSP",
  SUSP: "SUSP",
  INTERRUPTED: "INT",
  INT: "INT",
  INPLAY: "LIVE",
  LIVE: "LIVE",
  AWARDED: "AWD",
  AWD: "AWD",
  WO: "WO",
  WALKOVER: "WO",
};

function emptyScorePair(): ScorePair {
  return { home: null, away: null };
}

function emptyStandingRecord(): StandingRecord {
  return {
    played: 0,
    win: 0,
    draw: 0,
    lose: 0,
    goals: { for: 0, against: 0 },
  };
}

export function mapSportmonksState(
  state?: SportmonksState | null,
  fallback?: string | null,
): FixtureStatus {
  const candidates = [
    state?.developer_name,
    state?.state,
    state?.short_name,
    fallback,
  ]
    .filter(Boolean)
    .map((s) => String(s).trim().toUpperCase().replace(/\s+/g, "_"));

  for (const key of candidates) {
    if (STATE_MAP[key]) return STATE_MAP[key];
    if (VALID_STATUSES.has(key as FixtureStatus)) return key as FixtureStatus;
    if (key.includes("1ST") || key.includes("FIRST")) return "1H";
    if (key.includes("2ND") || key.includes("SECOND")) return "2H";
    if (key.includes("INPLAY") || key.includes("LIVE")) return "LIVE";
  }

  return "NS";
}

function scoreGoals(
  scores: SportmonksScore[] | undefined,
  descriptions: string[],
  typeIds: number[] = [],
): ScorePair {
  if (!scores?.length) return emptyScorePair();

  const normalized = descriptions.map((d) => d.toUpperCase());
  const matched = scores.filter((s) => {
    const desc = (s.description ?? s.type?.developer_name ?? s.type?.name ?? "")
      .toUpperCase()
      .replace(/\s+/g, "_");
    if (normalized.some((d) => desc === d || desc.includes(d))) return true;
    if (s.type_id != null && typeIds.includes(s.type_id)) return true;
    return false;
  });

  if (!matched.length) return emptyScorePair();

  let home: number | null = null;
  let away: number | null = null;

  for (const entry of matched) {
    const side = (entry.score?.participant ?? "").toLowerCase();
    const goals = entry.score?.goals ?? null;
    if (side === "home") home = goals;
    else if (side === "away") away = goals;
  }

  return { home, away };
}

function mapGoalsFromScores(scores?: SportmonksScore[]): {
  goals: ScorePair;
  score: Fixture["score"];
} {
  const current = scoreGoals(scores, ["CURRENT"], [1525]);
  const halftime = scoreGoals(scores, ["1ST_HALF", "FIRST_HALF", "HT"], [1]);
  const fulltime = scoreGoals(
    scores,
    ["2ND_HALF", "SECOND_HALF", "FT", "FULL_TIME", "CURRENT"],
    [2, 1525],
  );
  const extratime = scoreGoals(scores, ["ET", "EXTRA_TIME", "AET"], []);
  const penalty = scoreGoals(
    scores,
    ["PEN", "PENALTIES", "FT_PEN", "PENALTY"],
    [],
  );

  const goals =
    current.home != null || current.away != null
      ? current
      : fulltime.home != null || fulltime.away != null
        ? fulltime
        : halftime;

  return {
    goals,
    score: {
      halftime,
      fulltime:
        fulltime.home != null || fulltime.away != null ? fulltime : current,
      extratime,
      penalty,
    },
  };
}

function participantSide(
  participants: SportmonksParticipant[] | undefined,
  side: "home" | "away",
): SportmonksParticipant | undefined {
  if (!participants?.length) return undefined;
  const byMeta = participants.find(
    (p) => p.meta?.location?.toLowerCase() === side,
  );
  if (byMeta) return byMeta;
  return side === "home" ? participants[0] : participants[1];
}

function mapVenue(venue?: SportmonksVenue | null): Fixture["venue"] {
  if (!venue) {
    return { id: null, name: null, city: null };
  }
  return {
    id: venue.id ?? null,
    name: venue.name ?? null,
    city: venue.city_name ?? null,
    address: venue.address ?? null,
    capacity: venue.capacity ?? null,
    surface: venue.surface ?? null,
    image: venue.image_path ?? null,
  };
}

export function mapTeamFromSportmonks(
  team: SportmonksTeam | SportmonksParticipant,
): Team {
  return {
    id: team.id,
    name: team.name,
    code: team.short_code ?? null,
    country: team.country?.name ?? null,
    founded: team.founded ?? null,
    national: team.type === "national",
    logo: team.image_path ?? "",
    venue: team.venue ? mapVenue(team.venue) : null,
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

export function mapLeagueFromSportmonks(
  league: SportmonksLeague,
  seasonOverride?: number,
): League {
  const current =
    league.currentSeason ??
    league.current_season ??
    league.seasons?.find((s) => s.is_current) ??
    league.seasons?.[league.seasons.length - 1];

  const seasonYear =
    seasonOverride ??
    (current?.name ? parseSeasonYear(current.name) : undefined) ??
    current?.id ??
    new Date().getFullYear();

  return {
    id: league.id,
    name: league.name ?? `League ${league.id}`,
    country: league.country?.name ?? "Unknown",
    logo: league.image_path ?? "",
    flag: league.country?.image_path ?? null,
    season: seasonYear,
    round: null,
    type: league.type ?? league.sub_type ?? null,
  };
}

/** Extract a calendar year from season names like "2024/2025" or "2025". */
export function parseSeasonYear(name: string): number | undefined {
  const match = name.match(/(20\d{2})/g);
  if (!match?.length) return undefined;
  return Number(match[match.length - 1]);
}

/**
 * Sportmonks standings/topscorers use season *IDs* (e.g. 19735), not calendar years.
 * If `season` looks like a calendar year (≤ 3000), callers should resolve via league;
 * otherwise treat it as a season ID.
 */
export function looksLikeCalendarYear(season: number): boolean {
  return season >= 1990 && season <= 2100;
}

function mapEventType(event: SportmonksEvent): MatchEventType {
  const raw = [
    event.type?.developer_name,
    event.type?.name,
    event.type?.code,
    event.info,
    event.addition,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  if (
    raw.includes("GOAL") ||
    raw.includes("PENALTY") ||
    raw.includes("OWN_GOAL") ||
    event.type_id === 14
  ) {
    return "Goal";
  }
  if (
    raw.includes("CARD") ||
    raw.includes("YELLOW") ||
    raw.includes("RED") ||
    event.type_id === 19 ||
    event.type_id === 20 ||
    event.type_id === 21
  ) {
    return "Card";
  }
  if (
    raw.includes("SUBST") ||
    raw.includes("SUBSTITUTION") ||
    event.type_id === 18
  ) {
    return "subst";
  }
  if (raw.includes("VAR")) return "Var";
  return "Var";
}

function eventDetail(event: SportmonksEvent): string {
  return (
    event.info ??
    event.addition ??
    event.result ??
    event.type?.name ??
    event.type?.developer_name ??
    "Event"
  );
}

export function mapEvent(
  event: SportmonksEvent,
  index: number,
  participants?: SportmonksParticipant[],
): MatchEvent {
  const team =
    participants?.find((p) => p.id === event.participant_id) ??
    participants?.[0];

  const playerName =
    event.player_name ??
    event.player?.display_name ??
    event.player?.name ??
    event.player?.common_name ??
    null;
  const assistPlayer = event.relatedPlayer ?? event.relatedplayer ?? null;
  const assistName =
    event.related_player_name ??
    assistPlayer?.display_name ??
    assistPlayer?.name ??
    assistPlayer?.common_name ??
    null;

  return {
    id: String(
      event.id ?? `${event.participant_id ?? 0}-${event.minute ?? 0}-${index}`,
    ),
    time: {
      elapsed: event.minute ?? 0,
      extra: event.extra_minute ?? null,
    },
    team: {
      id: team?.id ?? event.participant_id ?? 0,
      name: team?.name ?? "Unknown",
      logo: team?.image_path ?? "",
    },
    player: {
      id: event.player_id ?? event.player?.id ?? null,
      name: playerName,
    },
    assist: {
      id: event.related_player_id ?? assistPlayer?.id ?? null,
      name: assistName,
    },
    type: mapEventType(event),
    detail: eventDetail(event),
    comments: event.addition ?? null,
  };
}

function statisticValue(stat: SportmonksStatistic): number | string | null {
  if (stat.data == null) return null;
  if (typeof stat.data === "number" || typeof stat.data === "string") {
    return stat.data;
  }
  if (typeof stat.data === "object" && "value" in stat.data) {
    return (stat.data.value as number | string | null) ?? null;
  }
  return null;
}

export function mapStatisticsForFixture(
  statistics: SportmonksStatistic[] | undefined,
  participants: SportmonksParticipant[] | undefined,
): MatchStatistics[] | undefined {
  if (!statistics?.length) return undefined;

  const byTeam = new Map<number, MatchStatistics>();

  for (const stat of statistics) {
    const teamId =
      stat.participant_id ??
      participants?.find(
        (p) => p.meta?.location?.toLowerCase() === stat.location?.toLowerCase(),
      )?.id;
    if (teamId == null) continue;

    const team =
      participants?.find((p) => p.id === teamId) ??
      ({
        id: teamId,
        name: `Team ${teamId}`,
        image_path: "",
      } as SportmonksParticipant);

    let bucket = byTeam.get(teamId);
    if (!bucket) {
      bucket = {
        team: {
          id: team.id,
          name: team.name,
          logo: team.image_path ?? "",
        },
        statistics: [],
      };
      byTeam.set(teamId, bucket);
    }

    bucket.statistics.push({
      type:
        stat.type?.name ??
        stat.type?.developer_name ??
        `type_${stat.type_id}`,
      value: statisticValue(stat),
    });
  }

  return Array.from(byTeam.values());
}

function isBenchLineup(row: SportmonksLineup): boolean {
  const name = (row.type?.developer_name ?? row.type?.name ?? "").toUpperCase();
  if (name.includes("BENCH") || name.includes("SUB")) return true;
  if (name.includes("LINEUP") || name.includes("START")) return false;
  if (row.type_id === 12) return true;
  if (row.type_id === 11) return false;
  return row.formation_position == null;
}

function lineupPlayerFromRow(row: SportmonksLineup) {
  const p = row.player;
  const joined = [p?.firstname, p?.lastname].filter(Boolean).join(" ");
  const name =
    row.player_name ??
    p?.display_name ??
    p?.name ??
    p?.common_name ??
    (joined || "Unknown");

  const grid =
    row.formation_position != null ? String(row.formation_position) : null;

  return {
    id: row.player_id ?? p?.id ?? 0,
    name,
    number: row.jersey_number ?? null,
    pos:
      row.position?.code ??
      row.position?.name ??
      row.position?.developer_name ??
      null,
    grid,
    photo: p?.image_path ?? undefined,
  };
}

export function mapLineupsFromSportmonks(
  lineups: SportmonksLineup[] | undefined,
  participants: SportmonksParticipant[] | undefined,
): FixtureLineup[] | undefined {
  if (!lineups?.length) return undefined;

  const byTeam = new Map<number, SportmonksLineup[]>();
  for (const row of lineups) {
    const teamId = row.team_id;
    if (teamId == null) continue;
    const list = byTeam.get(teamId) ?? [];
    list.push(row);
    byTeam.set(teamId, list);
  }

  const result: FixtureLineup[] = [];
  for (const [teamId, rows] of byTeam) {
    const team =
      participants?.find((p) => p.id === teamId) ??
      ({
        id: teamId,
        name: `Team ${teamId}`,
        image_path: "",
      } as SportmonksParticipant);

    const startXI = rows.filter((r) => !isBenchLineup(r)).map(lineupPlayerFromRow);
    const substitutes = rows
      .filter((r) => isBenchLineup(r))
      .map(lineupPlayerFromRow);

    const xi = startXI.length ? startXI : rows.map(lineupPlayerFromRow);
    const bench = startXI.length ? substitutes : [];

    result.push({
      team: {
        id: team.id,
        name: team.name,
        logo: team.image_path ?? "",
      },
      formation: null,
      coach: { id: null, name: null, photo: null },
      startXI: xi,
      substitutes: bench,
    });
  }

  return result;
}

export function mapTvStation(
  station: SportmonksTvStation | SportmonksFixtureTvStation,
): MatchStream {
  const nested =
    "tvstation" in station && station.tvstation ? station.tvstation : null;
  const id =
    nested?.id ??
    station.id ??
    ("tvstation_id" in station ? station.tvstation_id : 0) ??
    0;
  const name = nested?.name ?? station.name ?? "TV";
  const url = nested?.url ?? station.url ?? null;
  const logo = nested?.image_path ?? station.image_path ?? null;

  let type: MatchStream["type"] = "tv";
  const lower = `${name} ${url ?? ""}`.toLowerCase();
  if (lower.includes("youtube") || lower.includes("stream")) type = "stream";
  if (lower.includes("highlight")) type = "highlight";

  return {
    id: id ?? name,
    name,
    url,
    type,
    country: null,
    logo,
  };
}

export function getFixtureStreams(
  fixture: SportmonksFixture | Pick<Fixture, "streams">,
): MatchStream[] {
  if ("streams" in fixture && fixture.streams) {
    return fixture.streams;
  }
  const raw = (fixture as SportmonksFixture).tvStations;
  if (!raw?.length) return [];
  return raw.map(mapTvStation);
}

function elapsedFromPeriods(fixture: SportmonksFixture): number | null {
  const periods = fixture.periods;
  if (!periods?.length) return null;
  const ticking =
    periods.find((p) => p.ticking) ?? periods[periods.length - 1];
  if (ticking?.minutes != null) return ticking.minutes;
  if (ticking?.started && ticking.ticking) {
    const secs = Math.floor(Date.now() / 1000) - ticking.started;
    return Math.max(0, Math.floor(secs / 60) + (ticking.counts_from ?? 0));
  }
  return ticking?.minutes ?? null;
}

export function mapFixture(item: SportmonksFixture): Fixture {
  const homeP = participantSide(item.participants, "home");
  const awayP = participantSide(item.participants, "away");
  const { goals, score } = mapGoalsFromScores(item.scores);

  const homeTeam = homeP
    ? mapTeamFromSportmonks(homeP)
    : mapTeamRef({ id: 0, name: "TBD", logo: "" });
  const awayTeam = awayP
    ? mapTeamFromSportmonks(awayP)
    : mapTeamRef({ id: 0, name: "TBD", logo: "" });

  const mappedLeague = item.league
    ? mapLeagueFromSportmonks(item.league)
    : null;

  const seasonFromName =
    (item.season?.name ? parseSeasonYear(item.season.name) : undefined) ??
    (item.league?.currentSeason?.name
      ? parseSeasonYear(item.league.currentSeason.name)
      : undefined) ??
    (item.league?.current_season?.name
      ? parseSeasonYear(item.league.current_season.name)
      : undefined);

  const league = mappedLeague
    ? {
        ...mappedLeague,
        season: seasonFromName ?? mappedLeague.season,
      }
    : {
        id: item.league_id ?? 0,
        name: "Unknown",
        country: "Unknown",
        logo: "",
        flag: null,
        season: seasonFromName ?? item.season_id ?? new Date().getFullYear(),
        round: item.round?.name ?? null,
      };

  if (item.round?.name) {
    league.round = item.round.name;
  }

  const referee =
    item.referees?.[0]?.referee?.common_name ??
    item.referees?.[0]?.referee?.name ??
    null;

  const startingAt = item.starting_at
    ? item.starting_at.includes("T")
      ? item.starting_at
      : `${item.starting_at.replace(" ", "T")}Z`
    : new Date().toISOString();

  const timestamp =
    item.starting_at_timestamp ??
    Math.floor(new Date(startingAt).getTime() / 1000);

  return {
    id: item.id,
    referee,
    timezone: "UTC",
    date: new Date(startingAt).toISOString(),
    timestamp,
    venue: mapVenue(item.venue),
    status: mapSportmonksState(item.state),
    elapsed: elapsedFromPeriods(item),
    league,
    home: {
      ...homeTeam,
      winner: homeP?.meta?.winner ?? null,
    },
    away: {
      ...awayTeam,
      winner: awayP?.meta?.winner ?? null,
    },
    goals,
    score,
    events: item.events?.map((e, i) => mapEvent(e, i, item.participants)),
    statistics: mapStatisticsForFixture(item.statistics, item.participants),
    lineups: mapLineupsFromSportmonks(item.lineups, item.participants),
    streams: getFixtureStreams(item),
  };
}

function detailValue(
  details: SportmonksStandingDetail[] | undefined,
  names: string[],
): number {
  if (!details?.length) return 0;
  const upper = names.map((n) => n.toUpperCase());
  const found = details.find((d) => {
    const label = (
      d.type?.developer_name ??
      d.type?.name ??
      d.standing_type ??
      ""
    ).toUpperCase();
    return upper.some((n) => label === n || label.includes(n));
  });
  const v = found?.value;
  return typeof v === "number" ? v : Number(v) || 0;
}

function mapStandingRecord(
  details: SportmonksStandingDetail[] | undefined,
  prefix: "" | "HOME" | "AWAY",
): StandingRecord {
  const p = prefix ? `${prefix}_` : "";
  const played = detailValue(details, [
    `${p}MATCHES`,
    `${p}PLAYED`,
    `${p}GAMES`,
  ]);
  const win = detailValue(details, [`${p}WINS`, `${p}WON`, `${p}WIN`]);
  const draw = detailValue(details, [`${p}DRAWS`, `${p}DRAW`]);
  const lose = detailValue(details, [
    `${p}LOSSES`,
    `${p}LOST`,
    `${p}LOSE`,
    `${p}DEFEATS`,
  ]);
  const gf = detailValue(details, [`${p}GOALS_FOR`, `${p}GF`, `${p}SCORED`]);
  const ga = detailValue(details, [
    `${p}GOALS_AGAINST`,
    `${p}GA`,
    `${p}CONCEDED`,
  ]);

  if (!prefix && played === 0 && win === 0) {
    return {
      played: detailValue(details, ["OVERALL", "MATCHES_PLAYED", "PLAYED"]),
      win: detailValue(details, ["WON", "WINS", "WIN"]),
      draw: detailValue(details, ["DRAW", "DRAWS"]),
      lose: detailValue(details, ["LOST", "LOSSES", "LOSE"]),
      goals: {
        for: detailValue(details, ["GOALS_FOR", "GF", "SCORED"]),
        against: detailValue(details, ["GOALS_AGAINST", "GA", "CONCEDED"]),
      },
    };
  }

  return {
    played,
    win,
    draw,
    lose,
    goals: { for: gf, against: ga },
  };
}

function formString(form: SportmonksStanding["form"]): string | null {
  if (!form) return null;
  if (typeof form === "string") return form;
  if (Array.isArray(form)) {
    return (
      form
        .map((f) => f.form)
        .filter(Boolean)
        .join("")
        .slice(0, 5) || null
    );
  }
  return null;
}

export function mapStanding(
  row: SportmonksStanding,
  leagueId: number,
  season: number,
): Standing {
  const participant = row.participant;
  const all = mapStandingRecord(row.details, "");
  const home = mapStandingRecord(row.details, "HOME");
  const away = mapStandingRecord(row.details, "AWAY");

  const gf = all.goals.for || detailValue(row.details, ["GOALS_FOR", "GF"]);
  const ga =
    all.goals.against || detailValue(row.details, ["GOALS_AGAINST", "GA"]);
  const goalsDiff =
    detailValue(row.details, ["GOAL_DIFFERENCE", "GD", "DIFF"]) || gf - ga;

  const statusMap: Record<string, string> = {
    up: "up",
    down: "down",
    equal: "same",
  };

  return {
    rank: row.position ?? 0,
    team: {
      id: participant?.id ?? row.participant_id ?? 0,
      name: participant?.name ?? "Unknown",
      logo: participant?.image_path ?? "",
    },
    points: row.points ?? 0,
    goalsDiff,
    group: row.rule?.type?.name ?? "",
    form: formString(row.form),
    status: row.result
      ? (statusMap[row.result.toLowerCase()] ?? row.result)
      : null,
    description: row.rule?.type?.name ?? null,
    all: all.played || all.win ? all : emptyStandingRecord(),
    home: home.played || home.win ? home : emptyStandingRecord(),
    away: away.played || away.win ? away : emptyStandingRecord(),
    update: new Date().toISOString(),
    leagueId: row.league_id ?? leagueId,
    season: row.season_id ?? season,
  };
}

function ageFromDob(dob?: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function formatMeasure(
  value: number | string | null | undefined,
): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") return `${value} cm`;
  return String(value);
}

export function mapPlayer(player: SportmonksPlayer): Player {
  const team = player.teams?.[0];
  return {
    id: player.id,
    name:
      player.display_name ??
      player.name ??
      player.common_name ??
      [player.firstname, player.lastname].filter(Boolean).join(" ") ??
      "Unknown",
    firstname: player.firstname ?? null,
    lastname: player.lastname ?? null,
    age: ageFromDob(player.date_of_birth),
    nationality: player.nationality?.name ?? player.country?.name ?? null,
    height: formatMeasure(player.height),
    weight:
      player.weight == null || player.weight === ""
        ? null
        : typeof player.weight === "number"
          ? `${player.weight} kg`
          : String(player.weight),
    photo: player.image_path ?? "",
    position: player.position?.name ?? player.position?.developer_name ?? null,
    number: team?.meta?.jersey_number ?? null,
    team: team
      ? {
          id: team.id ?? 0,
          name: team.name ?? "Unknown",
          logo: team.image_path ?? "",
        }
      : null,
  };
}

export function mapTopscorer(item: SportmonksTopscorer): Player {
  const base = item.player
    ? mapPlayer(item.player)
    : {
        id: item.player_id ?? 0,
        name: "Unknown",
        firstname: null,
        lastname: null,
        age: null,
        nationality: null,
        height: null,
        weight: null,
        photo: "",
        position: null,
        number: null,
        team: null as Player["team"],
      };

  if (item.participant && !base.team) {
    base.team = {
      id: item.participant.id,
      name: item.participant.name,
      logo: item.participant.image_path ?? "",
    };
  }

  return base;
}

/** @deprecated Use mapLeagueFromSportmonks */
export const mapLeagueFromApi = mapLeagueFromSportmonks;
/** @deprecated Use mapTeamFromSportmonks */
export const mapTeamFromApi = mapTeamFromSportmonks;

export function mapStatistics(
  stats: SportmonksStatistic,
  participants?: SportmonksParticipant[],
): MatchStatistics {
  const mapped = mapStatisticsForFixture([stats], participants);
  return (
    mapped?.[0] ?? {
      team: { id: stats.participant_id ?? 0, name: "Unknown", logo: "" },
      statistics: [
        {
          type: stats.type?.name ?? `type_${stats.type_id}`,
          value: statisticValue(stats),
        },
      ],
    }
  );
}

export function mapLineup(lineup: SportmonksLineup): FixtureLineup {
  return {
    team: { id: lineup.team_id ?? 0, name: "Unknown", logo: "" },
    formation: null,
    coach: { id: null, name: null, photo: null },
    startXI: [lineupPlayerFromRow(lineup)],
    substitutes: [],
  };
}
