import { requireAdmin } from "@/lib/api/auth";
import { err, ok, withRateLimit, zodErr } from "@/lib/api/response";
import {
  getCachedFixturesByDate,
  getCachedLiveFixtures,
  getCachedStandings,
  getCachedTeams,
  invalidateFootballCache,
  getCachedLeagues,
  getCachedFixtureById,
} from "@/lib/cache/football-cache";
import { shouldUseMockData } from "@/lib/football";
import { syncLiveFixtures, summarizeChanges } from "@/lib/sync/sync-service";
import { recordSync } from "@/lib/sync/sync-meta";
import { syncActionSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const limited = withRateLimit(request, "admin-sync", 10, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin();
  if (!admin.ok) {
    if (admin.reason === "unauthorized") {
      return err("Authentication required", 401, { code: "UNAUTHORIZED" });
    }
    if (admin.reason === "forbidden") {
      return err("Admin access required", 403, { code: "FORBIDDEN" });
    }
    return err("Admin auth unavailable", 503, { code: "AUTH_UNAVAILABLE" });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = syncActionSchema.safeParse(body);
    if (!parsed.success) return zodErr(parsed.error);

    const action = parsed.data.action;
    const mockMode = shouldUseMockData();

    switch (action) {
      case "sync_live":
      case "live": {
        const result = await syncLiveFixtures();
        recordSync("live", result.fixtures.length);
        return ok({
          action: "live",
          mockMode,
          syncedAt: result.syncedAt,
          count: result.fixtures.length,
          changes: summarizeChanges(result.changes),
        });
      }

      case "sync_fixtures":
      case "fixtures": {
        const date =
          ("date" in parsed.data && parsed.data.date) ||
          new Date().toISOString().slice(0, 10);
        invalidateFootballCache(`football:fixtures:${date}`);
        const fixtures = await getCachedFixturesByDate(date);
        recordSync("fixtures", fixtures.length);
        return ok({
          action: "fixtures",
          mockMode,
          date,
          count: fixtures.length,
          syncedAt: new Date().toISOString(),
        });
      }

      case "sync_fixture": {
        const { fixtureId } = parsed.data;
        invalidateFootballCache(`football:fixture:${fixtureId}`);
        const fixture = await getCachedFixtureById(fixtureId);
        recordSync("fixture", fixture ? 1 : 0);
        return ok({
          action: "fixture",
          mockMode,
          fixtureId,
          found: Boolean(fixture),
          syncedAt: new Date().toISOString(),
        });
      }

      case "sync_leagues":
      case "leagues": {
        invalidateFootballCache("football:leagues:*");
        invalidateFootballCache("football:league:*");
        const leagues = await getCachedLeagues({
          country: "country" in parsed.data ? parsed.data.country : undefined,
          season: "season" in parsed.data ? parsed.data.season : undefined,
          current: true,
        });
        recordSync("leagues", leagues.length);
        return ok({
          action: "leagues",
          mockMode,
          count: leagues.length,
          syncedAt: new Date().toISOString(),
        });
      }

      case "sync_teams":
      case "teams": {
        invalidateFootballCache("football:teams:*");
        invalidateFootballCache("football:team:*");
        const leagueId =
          "leagueId" in parsed.data ? parsed.data.leagueId : undefined;
        const season =
          "season" in parsed.data ? parsed.data.season : undefined;
        const teams = await getCachedTeams({
          league: leagueId ?? 39,
          season: season ?? new Date().getFullYear(),
        });
        recordSync("teams", teams.length);
        return ok({
          action: "teams",
          mockMode,
          count: teams.length,
          syncedAt: new Date().toISOString(),
        });
      }

      case "sync_standings":
      case "standings": {
        const { leagueId, season } = parsed.data;
        invalidateFootballCache(`football:standings:${leagueId}:${season}`);
        const standings = await getCachedStandings(leagueId, season);
        recordSync("standings", standings.length);
        return ok({
          action: "standings",
          mockMode,
          leagueId,
          season,
          count: standings.length,
          syncedAt: new Date().toISOString(),
        });
      }

      case "invalidate_cache": {
        invalidateFootballCache(parsed.data.key ?? "football:*");
        // Warm live cache after broad invalidate for snappier admin UI.
        if (!parsed.data.key) {
          await getCachedLiveFixtures().catch(() => undefined);
        }
        recordSync("invalidate_cache", 0);
        return ok({
          action: "invalidate_cache",
          mockMode,
          key: parsed.data.key ?? "football:*",
          syncedAt: new Date().toISOString(),
        });
      }

      default:
        return err("Unknown sync action", 400, { code: "UNKNOWN_ACTION" });
    }
  } catch (error) {
    console.error("[api/admin/sync]", error);
    return err("Sync failed", 500, { code: "SYNC_ERROR" });
  }
}
