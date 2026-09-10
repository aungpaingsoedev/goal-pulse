import { getFootballService } from "@/lib/football";
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
    const service = getFootballService();
    const scorers = await service.getTopScorers(idParsed.data, season);

    return ok(scorers);
  } catch (error) {
    console.error("[api/leagues/[id]/top-scorers]", error);
    return err("Failed to load top scorers", 500, {
      code: "TOP_SCORERS_ERROR",
    });
  }
}
