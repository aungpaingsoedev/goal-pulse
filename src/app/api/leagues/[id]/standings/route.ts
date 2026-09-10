import { getCachedStandings } from "@/lib/cache/football-cache";
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

    const season = query.data.season ?? new Date().getFullYear();
    const standings = await getCachedStandings(idParsed.data, season);

    return ok(standings);
  } catch (error) {
    console.error("[api/leagues/[id]/standings]", error);
    return err("Failed to load standings", 500, { code: "STANDINGS_ERROR" });
  }
}
