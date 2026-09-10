import { getCachedPlayerById } from "@/lib/cache/football-cache";
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

    const player = await getCachedPlayerById(idParsed.data, query.data.season);
    if (!player) {
      return err("Player not found", 404, { code: "NOT_FOUND" });
    }

    return ok(player);
  } catch (error) {
    console.error("[api/players/[id]]", error);
    return err("Failed to load player", 500, { code: "PLAYER_ERROR" });
  }
}
