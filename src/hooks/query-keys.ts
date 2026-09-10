export const queryKeys = {
  liveMatches: ["live-matches"] as const,
  fixtures: (date: string, league?: number, status?: string) =>
    ["fixtures", date, league ?? null, status ?? null] as const,
  fixture: (id: number) => ["fixture", id] as const,
  leagues: (params?: Record<string, unknown>) =>
    ["leagues", params ?? {}] as const,
  league: (id: number, season?: number) =>
    ["league", id, season ?? null] as const,
  standings: (leagueId: number, season: number) =>
    ["standings", leagueId, season] as const,
  teams: (params?: Record<string, unknown>) =>
    ["teams", params ?? {}] as const,
  team: (id: number) => ["team", id] as const,
  players: (params?: Record<string, unknown>) =>
    ["players", params ?? {}] as const,
  player: (id: number, season?: number) =>
    ["player", id, season ?? null] as const,
  favorites: ["favorites"] as const,
  search: (q: string, type?: string) => ["search", q, type ?? "all"] as const,
  notifications: ["notifications"] as const,
  adminStats: ["admin-stats"] as const,
};
