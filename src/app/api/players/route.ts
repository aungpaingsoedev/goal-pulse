import { getCachedPlayers } from "@/lib/cache/football-cache";
import { err, ok, zodErr } from "@/lib/api/response";
import { playersQuerySchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = playersQuerySchema.safeParse({
      search: searchParams.get("search") || undefined,
      team: searchParams.get("team") || undefined,
      season: searchParams.get("season") || undefined,
      page: searchParams.get("page") || undefined,
    });

    if (!parsed.success) return zodErr(parsed.error);

    if (!parsed.data.search && !parsed.data.team) {
      return err("Provide search or team query parameter", 400, {
        code: "MISSING_QUERY",
      });
    }

    const players = await getCachedPlayers({
      search: parsed.data.search,
      team: parsed.data.team,
      season: parsed.data.season,
      page: parsed.data.page,
    });

    return ok(players);
  } catch (error) {
    console.error("[api/players]", error);
    return err("Failed to load players", 500, { code: "PLAYERS_ERROR" });
  }
}
