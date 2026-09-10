import { getCachedLeagues } from "@/lib/cache/football-cache";
import { err, ok, zodErr } from "@/lib/api/response";
import { leaguesQuerySchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = leaguesQuerySchema.safeParse({
      country: searchParams.get("country") || undefined,
      season: searchParams.get("season") || undefined,
      current: searchParams.get("current") || undefined,
    });

    if (!parsed.success) return zodErr(parsed.error);

    const leagues = await getCachedLeagues({
      country: parsed.data.country,
      season: parsed.data.season,
      current: parsed.data.current,
    });

    return ok(leagues);
  } catch (error) {
    console.error("[api/leagues]", error);
    return err("Failed to load leagues", 500, { code: "LEAGUES_ERROR" });
  }
}
