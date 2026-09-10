import { requireAdmin } from "@/lib/api/auth";
import { err, ok } from "@/lib/api/response";
import {
  getCachedFixturesByDate,
  getCachedLeagues,
  getCachedLiveFixtures,
} from "@/lib/cache/football-cache";
import { memoryCache } from "@/lib/cache/memory-cache";
import { prisma } from "@/lib/db";
import { shouldUseMockData } from "@/lib/football";
import { getSyncMeta } from "@/lib/sync/sync-meta";

export async function GET() {
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
    const today = new Date().toISOString().slice(0, 10);
    const mockMode = shouldUseMockData();

    const [live, todays, leagues, usersCount, teamsCount] = await Promise.all([
      getCachedLiveFixtures().catch(() => []),
      getCachedFixturesByDate(today).catch(() => []),
      getCachedLeagues({ current: true }).catch(() => []),
      prisma.user.count().catch(() => null),
      prisma.team.count().catch(() => null),
    ]);

    const sync = getSyncMeta();

    return ok({
      liveMatches: live.length,
      todaysMatches: todays.length,
      leagues: leagues.length,
      trackedTeams: teamsCount,
      users: usersCount,
      cacheEntries: memoryCache.size(),
      mockMode,
      lastSynchronization: sync.lastSyncAt,
      lastSyncAction: sync.lastSyncAction,
      lastSyncRecords: sync.lastSyncRecords,
      syncStatus: sync.lastSyncAt ? "ok" : "idle",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/admin/stats]", error);
    return err("Failed to load admin stats", 500, { code: "STATS_ERROR" });
  }
}
