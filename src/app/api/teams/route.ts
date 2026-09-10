import {
  getCachedTeamById,
  getCachedTeams,
} from "@/lib/cache/football-cache";
import { err, ok, zodErr } from "@/lib/api/response";
import { teamsQuerySchema } from "@/lib/validation/schemas";
import type { Team } from "@/types/football";

const POPULAR_TEAM_IDS = [
  33, 40, 42, 49, 50, 47, 529, 530, 541, 85, 157, 165, 489, 505,
];

async function getPopularTeams(): Promise<Team[]> {
  const teams = await Promise.all(
    POPULAR_TEAM_IDS.map((id) => getCachedTeamById(id)),
  );
  return teams.filter((t): t is Team => Boolean(t));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = teamsQuerySchema.safeParse({
      search: searchParams.get("search") || undefined,
      league: searchParams.get("league") || undefined,
      season: searchParams.get("season") || undefined,
    });

    if (!parsed.success) return zodErr(parsed.error);

    if (!parsed.data.search && !parsed.data.league) {
      return ok(await getPopularTeams());
    }

    const teams = await getCachedTeams({
      search: parsed.data.search,
      league: parsed.data.league,
      season: parsed.data.season,
    });

    return ok(teams);
  } catch (error) {
    console.error("[api/teams]", error);
    return err("Failed to load teams", 500, { code: "TEAMS_ERROR" });
  }
}
