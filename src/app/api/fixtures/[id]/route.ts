import { getCachedFixtureById } from "@/lib/cache/football-cache";
import { getFootballService } from "@/lib/football";
import { err, ok, zodErr } from "@/lib/api/response";
import { idParamSchema } from "@/lib/validation/schemas";
import type { Fixture } from "@/types/football";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const parsed = idParamSchema.safeParse(rawId);
    if (!parsed.success) return zodErr(parsed.error);

    const id = parsed.data;
    const service = getFootballService();
    let fixture = await getCachedFixtureById(id);

    if (!fixture) {
      return err("Fixture not found", 404, { code: "NOT_FOUND" });
    }

    const needsEvents = !fixture.events;
    const needsStats = !fixture.statistics;
    const needsLineups = !fixture.lineups;

    if (needsEvents || needsStats || needsLineups) {
      const [events, statistics, lineups] = await Promise.all([
        needsEvents ? service.getFixtureEvents(id) : Promise.resolve(fixture.events),
        needsStats
          ? service.getFixtureStatistics(id)
          : Promise.resolve(fixture.statistics),
        needsLineups
          ? service.getFixtureLineups(id)
          : Promise.resolve(fixture.lineups),
      ]);

      fixture = {
        ...fixture,
        events: events ?? [],
        statistics: statistics ?? [],
        lineups: lineups ?? [],
      } satisfies Fixture;
    }

    return ok(fixture);
  } catch (error) {
    console.error("[api/fixtures/[id]]", error);
    return err("Failed to load fixture", 500, { code: "FIXTURE_ERROR" });
  }
}
