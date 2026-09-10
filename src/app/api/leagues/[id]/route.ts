import { getCachedLeagueById } from "@/lib/cache/football-cache";
import { err, ok, zodErr } from "@/lib/api/response";
import { idParamSchema, standingsQuerySchema } from "@/lib/validation/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const idParsed = idParamSchema.safeParse(rawId);
    if (!idParsed.success) return zodErr(idParsed.error);

    const { searchParams } = new URL(request.url);
    const query = standingsQuerySchema.safeParse({
      season: searchParams.get("season") || undefined,
    });
    if (!query.success) return zodErr(query.error);

    const league = await getCachedLeagueById(idParsed.data, query.data.season);
    if (!league) {
      return err("League not found", 404, { code: "NOT_FOUND" });
    }

    return ok(league);
  } catch (error) {
    console.error("[api/leagues/[id]]", error);
    return err("Failed to load league", 500, { code: "LEAGUE_ERROR" });
  }
}
