import { getCachedFixturesByDate } from "@/lib/cache/football-cache";
import { err, ok, zodErr } from "@/lib/api/response";
import { fixturesQuerySchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = fixturesQuerySchema.safeParse({
      date: searchParams.get("date") ?? undefined,
      league: searchParams.get("league") || undefined,
      status: searchParams.get("status") || undefined,
    });

    if (!parsed.success) return zodErr(parsed.error);

    let fixtures = await getCachedFixturesByDate(parsed.data.date);

    if (parsed.data.league) {
      fixtures = fixtures.filter((f) => f.league.id === parsed.data.league);
    }

    if (parsed.data.status) {
      const status = parsed.data.status.toUpperCase();
      fixtures = fixtures.filter((f) => f.status === status);
    }

    return ok(fixtures);
  } catch (error) {
    console.error("[api/fixtures]", error);
    return err("Failed to load fixtures", 500, { code: "FIXTURES_ERROR" });
  }
}
