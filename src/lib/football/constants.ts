export const POPULAR_LEAGUE_IDS = [39, 140, 135, 78, 61, 2] as const;

export const POPULAR_LEAGUES = [
  { id: 39, name: "Premier League", short: "PL" },
  { id: 140, name: "La Liga", short: "LaLiga" },
  { id: 135, name: "Serie A", short: "Serie A" },
  { id: 78, name: "Bundesliga", short: "Bundesliga" },
  { id: 61, name: "Ligue 1", short: "Ligue 1" },
  { id: 2, name: "UEFA Champions League", short: "UCL" },
] as const;

export const LIVE_FILTERS = [
  { id: "all", label: "All", leagueIds: null },
  { id: "39", label: "Premier League", leagueIds: [39] },
  { id: "140", label: "La Liga", leagueIds: [140] },
  { id: "135", label: "Serie A", leagueIds: [135] },
  { id: "78", label: "Bundesliga", leagueIds: [78] },
  { id: "2", label: "Champions League", leagueIds: [2] },
  { id: "other", label: "Other", leagueIds: null },
] as const;

export const DEFAULT_SEASON = new Date().getFullYear();

export function isPopularLeagueId(id: number): boolean {
  return (POPULAR_LEAGUE_IDS as readonly number[]).includes(id);
}
