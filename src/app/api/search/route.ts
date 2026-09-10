import {
  getCachedFixturesByDate,
  getCachedLeagues,
  getCachedPlayers,
  getCachedTeams,
} from "@/lib/cache/football-cache";
import { err, ok, withRateLimit, zodErr } from "@/lib/api/response";
import { searchSchema } from "@/lib/validation/schemas";
import type { SearchResult } from "@/types/football";
import { z } from "zod";

const searchQuerySchema = searchSchema.extend({
  query: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(request: Request) {
  const limited = withRateLimit(request, "search", 30, 60_000);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = searchQuerySchema.safeParse({
      query: searchParams.get("q") ?? searchParams.get("query") ?? "",
      type: searchParams.get("type") ?? "all",
      limit: searchParams.get("limit") ?? 20,
    });

    if (!parsed.success) return zodErr(parsed.error);

    const { query, type, limit } = parsed.data;
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    const includeTeams = type === "all" || type === "team";
    const includeLeagues = type === "all" || type === "league";
    const includePlayers = type === "all" || type === "player";
    const includeFixtures = type === "all" || type === "fixture";

    const tasks: Promise<void>[] = [];

    if (includeTeams) {
      tasks.push(
        getCachedTeams({ search: query }).then((teams) => {
          for (const team of teams.slice(0, limit)) {
            results.push({
              type: "team",
              id: team.id,
              name: team.name,
              subtitle: team.country ?? undefined,
              image: team.logo,
            });
          }
        }),
      );
    }

    if (includeLeagues) {
      tasks.push(
        getCachedLeagues({ current: true }).then((leagues) => {
          for (const league of leagues) {
            if (!league.name.toLowerCase().includes(q)) continue;
            results.push({
              type: "league",
              id: league.id,
              name: league.name,
              subtitle: league.country,
              image: league.logo,
              meta: { season: league.season },
            });
          }
        }),
      );
    }

    if (includePlayers) {
      tasks.push(
        getCachedPlayers({ search: query }).then((players) => {
          for (const player of players.slice(0, limit)) {
            results.push({
              type: "player",
              id: player.id,
              name: player.name,
              subtitle: player.team?.name ?? player.nationality ?? undefined,
              image: player.photo,
            });
          }
        }),
      );
    }

    if (includeFixtures) {
      const today = new Date().toISOString().slice(0, 10);
      tasks.push(
        getCachedFixturesByDate(today).then((fixtures) => {
          for (const fixture of fixtures) {
            const label = `${fixture.home.name} vs ${fixture.away.name}`;
            if (!label.toLowerCase().includes(q)) continue;
            results.push({
              type: "fixture",
              id: fixture.id,
              name: label,
              subtitle: fixture.league.name,
              image: fixture.league.logo,
              meta: { status: fixture.status, date: fixture.date },
            });
          }
        }),
      );
    }

    await Promise.all(tasks);

    const ranked = results
      .sort((a, b) => {
        const aExact = a.name.toLowerCase() === q ? 0 : 1;
        const bExact = b.name.toLowerCase() === q ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);

    return ok(ranked);
  } catch (error) {
    console.error("[api/search]", error);
    return err("Search failed", 500, { code: "SEARCH_ERROR" });
  }
}
