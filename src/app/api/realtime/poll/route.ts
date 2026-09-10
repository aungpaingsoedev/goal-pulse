import { NextResponse } from "next/server";
import {
  syncLiveFixtures,
  summarizeChanges,
} from "@/lib/sync/sync-service";
import { REALTIME_EVENTS } from "@/lib/realtime/events";
import {
  emitFixtureUpdated,
  emitFixtureGoal,
  emitFixtureCard,
  emitFixtureSubstitution,
  emitFixtureStatus,
} from "@/lib/realtime/server";

/**
 * Polls live fixtures, syncs changes, and emits Socket.IO events.
 * Call from a cron job / Vercel cron / internal scheduler.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncLiveFixtures();

  for (const change of result.changes) {
    switch (change.type) {
      case REALTIME_EVENTS.FIXTURE_UPDATED:
        emitFixtureUpdated(change.payload);
        break;
      case REALTIME_EVENTS.FIXTURE_GOAL:
        emitFixtureGoal(change.payload);
        break;
      case REALTIME_EVENTS.FIXTURE_CARD:
        emitFixtureCard(change.payload);
        break;
      case REALTIME_EVENTS.FIXTURE_SUBSTITUTION:
        emitFixtureSubstitution(change.payload);
        break;
      case REALTIME_EVENTS.FIXTURE_STATUS:
        emitFixtureStatus(change.payload);
        break;
      default:
        break;
    }
  }

  return NextResponse.json({
    ok: true,
    syncedAt: result.syncedAt,
    fixtures: result.fixtures.length,
    changes: result.changes.length,
    summary: summarizeChanges(result.changes),
  });
}
