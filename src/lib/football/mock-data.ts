import type {
  Fixture,
  FixtureLineup,
  League,
  MatchEvent,
  MatchStatistics,
  Player,
  Standing,
  StandingRecord,
  Team,
} from "@/types/football";

const SEASON = 2025;
const LOGO = (id: number) => `https://media.api-sports.io/football/teams/${id}.png`;
const LEAGUE_LOGO = (id: number) =>
  `https://media.api-sports.io/football/leagues/${id}.png`;
const PLAYER_PHOTO = (id: number) =>
  `https://media.api-sports.io/football/players/${id}.png`;
const FLAG = (code: string) =>
  `https://media.api-sports.io/flags/${code}.svg`;

function record(
  played: number,
  win: number,
  draw: number,
  lose: number,
  gf: number,
  ga: number,
): StandingRecord {
  return {
    played,
    win,
    draw,
    lose,
    goals: { for: gf, against: ga },
  };
}

function team(
  id: number,
  name: string,
  code: string,
  country: string,
  founded: number,
  venueName: string,
  city: string,
  capacity: number,
): Team {
  return {
    id,
    name,
    code,
    country,
    founded,
    national: false,
    logo: LOGO(id),
    venue: {
      id: id * 10,
      name: venueName,
      city,
      capacity,
      surface: "grass",
      address: null,
      image: null,
    },
  };
}

export const MOCK_LEAGUES: League[] = [
  {
    id: 39,
    name: "Premier League",
    country: "England",
    logo: LEAGUE_LOGO(39),
    flag: FLAG("gb-eng"),
    season: SEASON,
    round: "Regular Season - 28",
    type: "League",
  },
  {
    id: 140,
    name: "La Liga",
    country: "Spain",
    logo: LEAGUE_LOGO(140),
    flag: FLAG("es"),
    season: SEASON,
    round: "Regular Season - 27",
    type: "League",
  },
  {
    id: 135,
    name: "Serie A",
    country: "Italy",
    logo: LEAGUE_LOGO(135),
    flag: FLAG("it"),
    season: SEASON,
    round: "Regular Season - 28",
    type: "League",
  },
  {
    id: 78,
    name: "Bundesliga",
    country: "Germany",
    logo: LEAGUE_LOGO(78),
    flag: FLAG("de"),
    season: SEASON,
    round: "Regular Season - 25",
    type: "League",
  },
  {
    id: 61,
    name: "Ligue 1",
    country: "France",
    logo: LEAGUE_LOGO(61),
    flag: FLAG("fr"),
    season: SEASON,
    round: "Regular Season - 26",
    type: "League",
  },
];

export const MOCK_TEAMS: Team[] = [
  team(50, "Manchester City", "MCI", "England", 1880, "Etihad Stadium", "Manchester", 55097),
  team(40, "Liverpool", "LIV", "England", 1892, "Anfield", "Liverpool", 61276),
  team(42, "Arsenal", "ARS", "England", 1886, "Emirates Stadium", "London", 60704),
  team(33, "Manchester United", "MUN", "England", 1878, "Old Trafford", "Manchester", 74310),
  team(49, "Chelsea", "CHE", "England", 1905, "Stamford Bridge", "London", 40341),
  team(47, "Tottenham", "TOT", "England", 1882, "Tottenham Hotspur Stadium", "London", 62850),
  team(66, "Aston Villa", "AVL", "England", 1874, "Villa Park", "Birmingham", 42640),
  team(34, "Newcastle", "NEW", "England", 1892, "St. James' Park", "Newcastle", 52305),
  team(48, "West Ham", "WHU", "England", 1895, "London Stadium", "London", 62500),
  team(51, "Brighton", "BHA", "England", 1901, "American Express Stadium", "Brighton", 31800),
  team(541, "Real Madrid", "RMA", "Spain", 1902, "Santiago Bernabéu", "Madrid", 81044),
  team(529, "Barcelona", "BAR", "Spain", 1899, "Spotify Camp Nou", "Barcelona", 99354),
  team(530, "Atletico Madrid", "ATM", "Spain", 1903, "Civitas Metropolitano", "Madrid", 70460),
  team(536, "Sevilla", "SEV", "Spain", 1890, "Ramón Sánchez-Pizjuán", "Seville", 43883),
  team(489, "AC Milan", "MIL", "Italy", 1899, "San Siro", "Milan", 75923),
  team(505, "Inter", "INT", "Italy", 1908, "San Siro", "Milan", 75923),
  team(496, "Juventus", "JUV", "Italy", 1897, "Allianz Stadium", "Turin", 41507),
  team(492, "Napoli", "NAP", "Italy", 1926, "Diego Armando Maradona", "Naples", 54726),
  team(157, "Bayern Munich", "BAY", "Germany", 1900, "Allianz Arena", "Munich", 75000),
  team(165, "Borussia Dortmund", "BVB", "Germany", 1909, "Signal Iduna Park", "Dortmund", 81365),
  team(85, "Paris Saint Germain", "PSG", "France", 1970, "Parc des Princes", "Paris", 47929),
  team(81, "Marseille", "OM", "France", 1899, "Orange Vélodrome", "Marseille", 67394),
];

function getTeam(id: number): Team {
  const found = MOCK_TEAMS.find((t) => t.id === id);
  if (!found) throw new Error(`Mock team ${id} not found`);
  return found;
}

function getLeague(id: number): League {
  const found = MOCK_LEAGUES.find((l) => l.id === id);
  if (!found) throw new Error(`Mock league ${id} not found`);
  return found;
}

function emptyScore() {
  return {
    halftime: { home: null as number | null, away: null as number | null },
    fulltime: { home: null as number | null, away: null as number | null },
    extratime: { home: null as number | null, away: null as number | null },
    penalty: { home: null as number | null, away: null as number | null },
  };
}

function makeEvent(
  fixtureId: number,
  index: number,
  elapsed: number,
  teamId: number,
  playerId: number,
  playerName: string,
  type: MatchEvent["type"],
  detail: string,
  assistName: string | null = null,
  assistId: number | null = null,
  extra: number | null = null,
): MatchEvent {
  const t = getTeam(teamId);
  return {
    id: `${fixtureId}-${index}`,
    time: { elapsed, extra },
    team: { id: t.id, name: t.name, logo: t.logo },
    player: { id: playerId, name: playerName },
    assist: { id: assistId, name: assistName },
    type,
    detail,
    comments: null,
  };
}

function makeStats(homeId: number, awayId: number): MatchStatistics[] {
  const home = getTeam(homeId);
  const away = getTeam(awayId);
  return [
    {
      team: { id: home.id, name: home.name, logo: home.logo },
      statistics: [
        { type: "Shots on Goal", value: 7 },
        { type: "Shots off Goal", value: 5 },
        { type: "Total Shots", value: 14 },
        { type: "Blocked Shots", value: 2 },
        { type: "Ball Possession", value: "58%" },
        { type: "Corner Kicks", value: 6 },
        { type: "Offsides", value: 2 },
        { type: "Fouls", value: 9 },
        { type: "Yellow Cards", value: 1 },
        { type: "Red Cards", value: 0 },
        { type: "Goalkeeper Saves", value: 3 },
        { type: "Total passes", value: 512 },
        { type: "Passes accurate", value: 448 },
        { type: "Passes %", value: "87%" },
        { type: "expected_goals", value: "1.92" },
      ],
    },
    {
      team: { id: away.id, name: away.name, logo: away.logo },
      statistics: [
        { type: "Shots on Goal", value: 4 },
        { type: "Shots off Goal", value: 6 },
        { type: "Total Shots", value: 11 },
        { type: "Blocked Shots", value: 1 },
        { type: "Ball Possession", value: "42%" },
        { type: "Corner Kicks", value: 3 },
        { type: "Offsides", value: 1 },
        { type: "Fouls", value: 12 },
        { type: "Yellow Cards", value: 2 },
        { type: "Red Cards", value: 0 },
        { type: "Goalkeeper Saves", value: 5 },
        { type: "Total passes", value: 381 },
        { type: "Passes accurate", value: 312 },
        { type: "Passes %", value: "82%" },
        { type: "expected_goals", value: "1.14" },
      ],
    },
  ];
}

function makeLineups(homeId: number, awayId: number): FixtureLineup[] {
  const home = getTeam(homeId);
  const away = getTeam(awayId);

  const xi = (
    teamId: number,
    names: Array<[number, string, number, string, string]>,
  ) =>
    names.map(([id, name, number, pos, grid]) => ({
      id,
      name,
      number,
      pos,
      grid,
      photo: PLAYER_PHOTO(id),
    }));

  return [
    {
      team: { id: home.id, name: home.name, logo: home.logo },
      formation: "4-3-3",
      coach: { id: 1, name: "Pep Guardiola", photo: null },
      startXI: xi(homeId, [
        [617, "Ederson", 31, "G", "1:1"],
        [627, "Kyle Walker", 2, "D", "2:4"],
        [626, "Rúben Dias", 3, "D", "2:3"],
        [567, "John Stones", 5, "D", "2:2"],
        [641, "Josko Gvardiol", 24, "D", "2:1"],
        [629, "Rodri", 16, "M", "3:3"],
        [636, "Kevin De Bruyne", 17, "M", "3:2"],
        [635, "Bernardo Silva", 20, "M", "3:1"],
        [1100, "Phil Foden", 47, "F", "4:3"],
        [278, "Erling Haaland", 9, "F", "4:2"],
        [882, "Jeremy Doku", 11, "F", "4:1"],
      ]),
      substitutes: [
        { id: 50828, name: "Stefan Ortega", number: 18, pos: "G", grid: null, photo: PLAYER_PHOTO(50828) },
        { id: 18861, name: "Nathan Aké", number: 6, pos: "D", grid: null, photo: PLAYER_PHOTO(18861) },
        { id: 44, name: "Mateo Kovacic", number: 8, pos: "M", grid: null, photo: PLAYER_PHOTO(44) },
        { id: 645, name: "Julián Álvarez", number: 19, pos: "F", grid: null, photo: PLAYER_PHOTO(645) },
      ],
    },
    {
      team: { id: away.id, name: away.name, logo: away.logo },
      formation: "4-3-3",
      coach: { id: 2, name: "Arne Slot", photo: null },
      startXI: xi(awayId, [
        [280, "Alisson", 1, "G", "1:1"],
        [293, "Trent Alexander-Arnold", 66, "D", "2:4"],
        [290, "Virgil van Dijk", 4, "D", "2:3"],
        [1145, "Ibrahima Konaté", 5, "D", "2:2"],
        [1149, "Andy Robertson", 26, "D", "2:1"],
        [1096, "Alexis Mac Allister", 10, "M", "3:3"],
        [306, "Dominik Szoboszlai", 8, "M", "3:2"],
        [304, "Ryan Gravenberch", 38, "M", "3:1"],
        [1101, "Mohamed Salah", 11, "F", "4:3"],
        [51627, "Darwin Núñez", 9, "F", "4:2"],
        [1466, "Luis Díaz", 7, "F", "4:1"],
      ]),
      substitutes: [
        { id: 1625, name: "Caoimhín Kelleher", number: 62, pos: "G", grid: null, photo: PLAYER_PHOTO(1625) },
        { id: 284, name: "Joe Gomez", number: 2, pos: "D", grid: null, photo: PLAYER_PHOTO(284) },
        { id: 1094, name: "Curtis Jones", number: 17, pos: "M", grid: null, photo: PLAYER_PHOTO(1094) },
        { id: 305, name: "Diogo Jota", number: 20, pos: "F", grid: null, photo: PLAYER_PHOTO(305) },
      ],
    },
  ];
}

function isoDaysFromNow(days: number, hour = 15, minute = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

function ts(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000);
}

const liveDate = isoDaysFromNow(0, 14, 30);
const liveDate2 = isoDaysFromNow(0, 15, 0);
const liveDate3 = isoDaysFromNow(0, 16, 0);
const finishedDate = isoDaysFromNow(-1, 17, 30);
const finishedDate2 = isoDaysFromNow(-2, 15, 0);
const upcomingDate = isoDaysFromNow(2, 16, 30);
const upcomingDate2 = isoDaysFromNow(3, 14, 0);
const upcomingDate3 = isoDaysFromNow(5, 19, 0);

export const MOCK_FIXTURES: Fixture[] = [
  {
    id: 1200001,
    referee: "Michael Oliver",
    timezone: "UTC",
    date: liveDate,
    timestamp: ts(liveDate),
    venue: getTeam(50).venue!,
    status: "2H",
    elapsed: 67,
    league: getLeague(39),
    home: { ...getTeam(50), winner: null },
    away: { ...getTeam(40), winner: null },
    goals: { home: 2, away: 1 },
    score: {
      ...emptyScore(),
      halftime: { home: 1, away: 1 },
    },
    events: [
      makeEvent(1200001, 1, 12, 50, 278, "Erling Haaland", "Goal", "Normal Goal", "Kevin De Bruyne", 636),
      makeEvent(1200001, 2, 28, 40, 1101, "Mohamed Salah", "Goal", "Penalty"),
      makeEvent(1200001, 3, 41, 40, 290, "Virgil van Dijk", "Card", "Yellow Card"),
      makeEvent(1200001, 4, 54, 50, 1100, "Phil Foden", "Goal", "Normal Goal", "Bernardo Silva", 635),
      makeEvent(1200001, 5, 61, 40, 51627, "Darwin Núñez", "subst", "Substitution 1", "Diogo Jota", 305),
    ],
    statistics: makeStats(50, 40),
    lineups: makeLineups(50, 40),
    streams: [
      {
        id: "sky-sports",
        name: "Sky Sports Main Event",
        url: null,
        type: "tv",
        country: "England",
        logo: null,
      },
      {
        id: "yt-highlight-mci-liv",
        name: "Match Highlights",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        type: "highlight",
        country: null,
        logo: null,
      },
    ],
  },
  {
    id: 1200002,
    referee: "Anthony Taylor",
    timezone: "UTC",
    date: liveDate2,
    timestamp: ts(liveDate2),
    venue: getTeam(42).venue!,
    status: "1H",
    elapsed: 34,
    league: getLeague(39),
    home: { ...getTeam(42), winner: null },
    away: { ...getTeam(49), winner: null },
    goals: { home: 1, away: 0 },
    score: emptyScore(),
    events: [
      makeEvent(1200002, 1, 19, 42, 643, "Bukayo Saka", "Goal", "Normal Goal", "Martin Ødegaard", 1465),
      makeEvent(1200002, 2, 27, 49, 2207, "Moisés Caicedo", "Card", "Yellow Card"),
    ],
    statistics: makeStats(42, 49),
    streams: [
      {
        id: "tnt-sports",
        name: "TNT Sports 1",
        url: null,
        type: "tv",
        country: "England",
        logo: null,
      },
    ],
  },
  {
    id: 1200003,
    referee: "José María Sánchez",
    timezone: "UTC",
    date: liveDate3,
    timestamp: ts(liveDate3),
    venue: getTeam(541).venue!,
    status: "HT",
    elapsed: 45,
    league: getLeague(140),
    home: { ...getTeam(541), winner: null },
    away: { ...getTeam(529), winner: null },
    goals: { home: 1, away: 1 },
    score: {
      ...emptyScore(),
      halftime: { home: 1, away: 1 },
    },
    events: [
      makeEvent(1200003, 1, 23, 541, 754, "Vinícius Júnior", "Goal", "Normal Goal", "Jude Bellingham", 19545),
      makeEvent(1200003, 2, 38, 529, 521, "Robert Lewandowski", "Goal", "Normal Goal", "Lamine Yamal", 386822),
    ],
    statistics: makeStats(541, 529),
    streams: [
      {
        id: "movistar",
        name: "Movistar LaLiga",
        url: null,
        type: "tv",
        country: "Spain",
        logo: null,
      },
      {
        id: "yt-highlight-rma-bar",
        name: "El Clásico Highlights",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        type: "highlight",
        country: null,
        logo: null,
      },
    ],
  },
  {
    id: 1200004,
    referee: "Felix Zwayer",
    timezone: "UTC",
    date: liveDate2,
    timestamp: ts(liveDate2),
    venue: getTeam(157).venue!,
    status: "2H",
    elapsed: 78,
    league: getLeague(78),
    home: { ...getTeam(157), winner: null },
    away: { ...getTeam(165), winner: null },
    goals: { home: 3, away: 2 },
    score: {
      ...emptyScore(),
      halftime: { home: 2, away: 1 },
    },
    events: [
      makeEvent(1200004, 1, 8, 157, 521, "Harry Kane", "Goal", "Normal Goal"),
      makeEvent(1200004, 2, 22, 165, 2282, "Niclas Füllkrug", "Goal", "Normal Goal"),
      makeEvent(1200004, 3, 41, 157, 522, "Jamal Musiala", "Goal", "Normal Goal"),
      makeEvent(1200004, 4, 58, 165, 1097, "Julian Brandt", "Goal", "Normal Goal"),
      makeEvent(1200004, 5, 71, 157, 278, "Leroy Sané", "Goal", "Normal Goal"),
    ],
    streams: [
      {
        id: "sky-de",
        name: "Sky Sport Bundesliga",
        url: null,
        type: "tv",
        country: "Germany",
        logo: null,
      },
    ],
  },
  {
    id: 1200101,
    referee: "Paul Tierney",
    timezone: "UTC",
    date: finishedDate,
    timestamp: ts(finishedDate),
    venue: getTeam(33).venue!,
    status: "FT",
    elapsed: 90,
    league: getLeague(39),
    home: { ...getTeam(33), winner: false },
    away: { ...getTeam(47), winner: true },
    goals: { home: 1, away: 2 },
    score: {
      ...emptyScore(),
      halftime: { home: 0, away: 1 },
      fulltime: { home: 1, away: 2 },
    },
    events: [
      makeEvent(1200101, 1, 17, 47, 186, "Son Heung-min", "Goal", "Normal Goal"),
      makeEvent(1200101, 2, 55, 33, 909, "Bruno Fernandes", "Goal", "Penalty"),
      makeEvent(1200101, 3, 81, 47, 3035, "James Maddison", "Goal", "Normal Goal"),
    ],
    statistics: makeStats(33, 47),
  },
  {
    id: 1200102,
    referee: "Davide Massa",
    timezone: "UTC",
    date: finishedDate2,
    timestamp: ts(finishedDate2),
    venue: getTeam(505).venue!,
    status: "FT",
    elapsed: 90,
    league: getLeague(135),
    home: { ...getTeam(505), winner: true },
    away: { ...getTeam(489), winner: false },
    goals: { home: 2, away: 0 },
    score: {
      ...emptyScore(),
      halftime: { home: 1, away: 0 },
      fulltime: { home: 2, away: 0 },
    },
    events: [
      makeEvent(1200102, 1, 33, 505, 874, "Lautaro Martínez", "Goal", "Normal Goal"),
      makeEvent(1200102, 2, 72, 505, 1866, "Marcus Thuram", "Goal", "Normal Goal"),
    ],
  },
  {
    id: 1200103,
    referee: "Clément Turpin",
    timezone: "UTC",
    date: finishedDate,
    timestamp: ts(finishedDate),
    venue: getTeam(85).venue!,
    status: "FT",
    elapsed: 90,
    league: getLeague(61),
    home: { ...getTeam(85), winner: true },
    away: { ...getTeam(81), winner: false },
    goals: { home: 3, away: 1 },
    score: {
      ...emptyScore(),
      halftime: { home: 2, away: 0 },
      fulltime: { home: 3, away: 1 },
    },
  },
  {
    id: 1200201,
    referee: null,
    timezone: "UTC",
    date: upcomingDate,
    timestamp: ts(upcomingDate),
    venue: getTeam(66).venue!,
    status: "NS",
    elapsed: null,
    league: getLeague(39),
    home: { ...getTeam(66), winner: null },
    away: { ...getTeam(34), winner: null },
    goals: { home: null, away: null },
    score: emptyScore(),
  },
  {
    id: 1200202,
    referee: null,
    timezone: "UTC",
    date: upcomingDate2,
    timestamp: ts(upcomingDate2),
    venue: getTeam(530).venue!,
    status: "NS",
    elapsed: null,
    league: getLeague(140),
    home: { ...getTeam(530), winner: null },
    away: { ...getTeam(536), winner: null },
    goals: { home: null, away: null },
    score: emptyScore(),
  },
  {
    id: 1200203,
    referee: null,
    timezone: "UTC",
    date: upcomingDate3,
    timestamp: ts(upcomingDate3),
    venue: getTeam(492).venue!,
    status: "NS",
    elapsed: null,
    league: getLeague(135),
    home: { ...getTeam(492), winner: null },
    away: { ...getTeam(496), winner: null },
    goals: { home: null, away: null },
    score: emptyScore(),
  },
  {
    id: 1200204,
    referee: null,
    timezone: "UTC",
    date: upcomingDate,
    timestamp: ts(upcomingDate),
    venue: getTeam(48).venue!,
    status: "NS",
    elapsed: null,
    league: getLeague(39),
    home: { ...getTeam(48), winner: null },
    away: { ...getTeam(51), winner: null },
    goals: { home: null, away: null },
    score: emptyScore(),
  },
];

function standingRow(
  rank: number,
  teamId: number,
  points: number,
  gd: number,
  form: string,
  all: StandingRecord,
  description: string | null,
): Standing {
  const t = getTeam(teamId);
  return {
    rank,
    team: { id: t.id, name: t.name, logo: t.logo },
    points,
    goalsDiff: gd,
    group: "Premier League",
    form,
    status: "same",
    description,
    all,
    home: record(
      Math.ceil(all.played / 2),
      Math.ceil(all.win / 2),
      Math.floor(all.draw / 2),
      Math.floor(all.lose / 2),
      Math.ceil(all.goals.for / 2),
      Math.floor(all.goals.against / 2),
    ),
    away: record(
      Math.floor(all.played / 2),
      Math.floor(all.win / 2),
      Math.ceil(all.draw / 2),
      Math.ceil(all.lose / 2),
      Math.floor(all.goals.for / 2),
      Math.ceil(all.goals.against / 2),
    ),
    update: new Date().toISOString(),
    leagueId: 39,
    season: SEASON,
  };
}

export const MOCK_STANDINGS: Standing[] = [
  standingRow(1, 40, 64, 38, "WWWDW", record(27, 20, 4, 3, 65, 27), "Promotion - Champions League (Group Stage)"),
  standingRow(2, 42, 61, 35, "WDWWW", record(27, 19, 4, 4, 62, 27), "Promotion - Champions League (Group Stage)"),
  standingRow(3, 50, 59, 32, "DWWWL", record(27, 18, 5, 4, 60, 28), "Promotion - Champions League (Group Stage)"),
  standingRow(4, 66, 52, 18, "WWDLW", record(27, 16, 4, 7, 52, 34), "Promotion - Champions League (Group Stage)"),
  standingRow(5, 47, 50, 14, "LWWWD", record(27, 15, 5, 7, 55, 41), "Promotion - Europa League"),
  standingRow(6, 34, 47, 12, "WLWDW", record(27, 14, 5, 8, 48, 36), null),
  standingRow(7, 49, 44, 8, "DWLWW", record(27, 13, 5, 9, 51, 43), null),
  standingRow(8, 33, 41, 2, "LLDWW", record(27, 12, 5, 10, 42, 40), null),
  standingRow(9, 51, 39, 0, "WDLLD", record(27, 10, 9, 8, 40, 40), null),
  standingRow(10, 48, 33, -8, "LLWDL", record(27, 9, 6, 12, 38, 46), null),
];

export const MOCK_LA_LIGA_STANDINGS: Standing[] = [
  {
    ...standingRow(1, 541, 58, 40, "WWWWW", record(26, 18, 4, 4, 58, 18), "Promotion - Champions League"),
    group: "La Liga",
    leagueId: 140,
  },
  {
    ...standingRow(2, 529, 55, 36, "WDWWW", record(26, 17, 4, 5, 55, 19), "Promotion - Champions League"),
    group: "La Liga",
    leagueId: 140,
  },
  {
    ...standingRow(3, 530, 50, 22, "WWDLW", record(26, 15, 5, 6, 45, 23), "Promotion - Champions League"),
    group: "La Liga",
    leagueId: 140,
  },
  {
    ...standingRow(4, 536, 42, 8, "DWLDW", record(26, 12, 6, 8, 38, 30), "Promotion - Europa League"),
    group: "La Liga",
    leagueId: 140,
  },
];

export const MOCK_PLAYERS: Player[] = [
  {
    id: 278,
    name: "E. Haaland",
    firstname: "Erling",
    lastname: "Haaland",
    age: 25,
    nationality: "Norway",
    height: "194 cm",
    weight: "88 kg",
    photo: PLAYER_PHOTO(278),
    position: "Attacker",
    number: 9,
    team: { id: 50, name: "Manchester City", logo: LOGO(50) },
  },
  {
    id: 1101,
    name: "M. Salah",
    firstname: "Mohamed",
    lastname: "Salah",
    age: 33,
    nationality: "Egypt",
    height: "175 cm",
    weight: "71 kg",
    photo: PLAYER_PHOTO(1101),
    position: "Attacker",
    number: 11,
    team: { id: 40, name: "Liverpool", logo: LOGO(40) },
  },
  {
    id: 643,
    name: "B. Saka",
    firstname: "Bukayo",
    lastname: "Saka",
    age: 24,
    nationality: "England",
    height: "178 cm",
    weight: "72 kg",
    photo: PLAYER_PHOTO(643),
    position: "Attacker",
    number: 7,
    team: { id: 42, name: "Arsenal", logo: LOGO(42) },
  },
  {
    id: 754,
    name: "Vinícius Júnior",
    firstname: "Vinícius",
    lastname: "Júnior",
    age: 25,
    nationality: "Brazil",
    height: "176 cm",
    weight: "73 kg",
    photo: PLAYER_PHOTO(754),
    position: "Attacker",
    number: 7,
    team: { id: 541, name: "Real Madrid", logo: LOGO(541) },
  },
  {
    id: 521,
    name: "R. Lewandowski",
    firstname: "Robert",
    lastname: "Lewandowski",
    age: 37,
    nationality: "Poland",
    height: "185 cm",
    weight: "81 kg",
    photo: PLAYER_PHOTO(521),
    position: "Attacker",
    number: 9,
    team: { id: 529, name: "Barcelona", logo: LOGO(529) },
  },
  {
    id: 636,
    name: "K. De Bruyne",
    firstname: "Kevin",
    lastname: "De Bruyne",
    age: 34,
    nationality: "Belgium",
    height: "181 cm",
    weight: "70 kg",
    photo: PLAYER_PHOTO(636),
    position: "Midfielder",
    number: 17,
    team: { id: 50, name: "Manchester City", logo: LOGO(50) },
  },
  {
    id: 290,
    name: "V. van Dijk",
    firstname: "Virgil",
    lastname: "van Dijk",
    age: 34,
    nationality: "Netherlands",
    height: "193 cm",
    weight: "92 kg",
    photo: PLAYER_PHOTO(290),
    position: "Defender",
    number: 4,
    team: { id: 40, name: "Liverpool", logo: LOGO(40) },
  },
  {
    id: 874,
    name: "L. Martínez",
    firstname: "Lautaro",
    lastname: "Martínez",
    age: 28,
    nationality: "Argentina",
    height: "174 cm",
    weight: "72 kg",
    photo: PLAYER_PHOTO(874),
    position: "Attacker",
    number: 10,
    team: { id: 505, name: "Inter", logo: LOGO(505) },
  },
];

const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT", "SUSP"]);

function sameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export class MockFootballClient {
  async getLiveFixtures(): Promise<Fixture[]> {
    return MOCK_FIXTURES.filter((f) => LIVE_STATUSES.has(f.status));
  }

  async getFixturesByDate(date: string): Promise<Fixture[]> {
    return MOCK_FIXTURES.filter((f) => sameDay(f.date, date));
  }

  async getFixtureById(id: number): Promise<Fixture | null> {
    return MOCK_FIXTURES.find((f) => f.id === id) ?? null;
  }

  async getLeagues(params: {
    country?: string;
    season?: number;
    current?: boolean;
  } = {}): Promise<League[]> {
    let leagues = [...MOCK_LEAGUES];
    if (params.country) {
      leagues = leagues.filter(
        (l) => l.country.toLowerCase() === params.country!.toLowerCase(),
      );
    }
    return leagues;
  }

  async getLeagueById(id: number): Promise<League | null> {
    return MOCK_LEAGUES.find((l) => l.id === id) ?? null;
  }

  async getStandings(leagueId: number, season: number): Promise<Standing[]> {
    void season;
    if (leagueId === 140) return MOCK_LA_LIGA_STANDINGS;
    if (leagueId === 39) return MOCK_STANDINGS;
    return MOCK_STANDINGS.filter(() => false);
  }

  async getTeams(params: {
    league?: number;
    season?: number;
    search?: string;
    id?: number;
  } = {}): Promise<Team[]> {
    let teams = [...MOCK_TEAMS];
    if (params.id) {
      teams = teams.filter((t) => t.id === params.id);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      teams = teams.filter((t) => t.name.toLowerCase().includes(q));
    }
    if (params.league === 39) {
      teams = teams.filter((t) => t.country === "England");
    } else if (params.league === 140) {
      teams = teams.filter((t) => t.country === "Spain");
    } else if (params.league === 135) {
      teams = teams.filter((t) => t.country === "Italy");
    } else if (params.league === 78) {
      teams = teams.filter((t) => t.country === "Germany");
    } else if (params.league === 61) {
      teams = teams.filter((t) => t.country === "France");
    }
    return teams;
  }

  async getTeamById(id: number): Promise<Team | null> {
    return MOCK_TEAMS.find((t) => t.id === id) ?? null;
  }

  async getPlayers(params: {
    team?: number;
    season?: number;
    search?: string;
    page?: number;
  } = {}): Promise<Player[]> {
    let players = [...MOCK_PLAYERS];
    if (params.team) {
      players = players.filter((p) => p.team?.id === params.team);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      players = players.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.firstname?.toLowerCase().includes(q) ||
          p.lastname?.toLowerCase().includes(q),
      );
    }
    return players;
  }

  async getPlayerById(id: number): Promise<Player | null> {
    return MOCK_PLAYERS.find((p) => p.id === id) ?? null;
  }

  async getHeadToHead(team1: number, team2: number): Promise<Fixture[]> {
    return MOCK_FIXTURES.filter(
      (f) =>
        (f.home.id === team1 && f.away.id === team2) ||
        (f.home.id === team2 && f.away.id === team1),
    );
  }

  async getFixtureEvents(fixtureId: number) {
    const fixture = await this.getFixtureById(fixtureId);
    return fixture?.events ?? [];
  }

  async getFixtureStatistics(fixtureId: number) {
    const fixture = await this.getFixtureById(fixtureId);
    return fixture?.statistics ?? [];
  }

  async getFixtureLineups(fixtureId: number) {
    const fixture = await this.getFixtureById(fixtureId);
    return fixture?.lineups ?? [];
  }

  async getTopScorers(leagueId: number, season: number): Promise<Player[]> {
    void season;
    if (leagueId === 140) {
      return MOCK_PLAYERS.filter((p) =>
        [541, 529, 530].includes(p.team?.id ?? -1),
      );
    }
    return MOCK_PLAYERS.filter((p) =>
      [50, 40, 42, 33, 49].includes(p.team?.id ?? -1),
    );
  }
}
