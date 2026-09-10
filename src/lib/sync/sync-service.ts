import "server-only";

import {
  getCachedLiveFixtures,
  invalidateFootballCache,
} from "@/lib/cache/football-cache";
import { getFootballService } from "@/lib/football";
import {
  REALTIME_EVENTS,
  type FixtureCardPayload,
  type FixtureGoalPayload,
  type FixtureStatusPayload,
  type FixtureSubstitutionPayload,
  type FixtureUpdatedPayload,
  type RealtimePayload,
} from "@/lib/realtime/events";
import type { Fixture, MatchEvent } from "@/types/football";

export type DetectedChange =
  | { type: typeof REALTIME_EVENTS.FIXTURE_UPDATED; payload: FixtureUpdatedPayload }
  | { type: typeof REALTIME_EVENTS.FIXTURE_GOAL; payload: FixtureGoalPayload }
  | { type: typeof REALTIME_EVENTS.FIXTURE_CARD; payload: FixtureCardPayload }
  | {
      type: typeof REALTIME_EVENTS.FIXTURE_SUBSTITUTION;
      payload: FixtureSubstitutionPayload;
    }
  | { type: typeof REALTIME_EVENTS.FIXTURE_STATUS; payload: FixtureStatusPayload };

function eventKey(event: MatchEvent): string {
  return `${event.time.elapsed}-${event.time.extra ?? 0}-${event.type}-${event.detail}-${event.player.id}-${event.assist.id}`;
}

function findNewEvents(
  previous: MatchEvent[] | undefined,
  next: MatchEvent[] | undefined,
): MatchEvent[] {
  if (!next?.length) return [];
  if (!previous?.length) return next;

  const seen = new Set(previous.map(eventKey));
  return next.filter((event) => !seen.has(eventKey(event)));
}

export function detectChanges(
  oldFixture: Fixture | undefined,
  newFixture: Fixture,
): DetectedChange[] {
  const changedAt = new Date().toISOString();
  const changes: DetectedChange[] = [];

  if (!oldFixture) {
    changes.push({
      type: REALTIME_EVENTS.FIXTURE_UPDATED,
      payload: { fixture: newFixture, changedAt },
    });
    return changes;
  }

  let touched = false;

  if (
    oldFixture.status !== newFixture.status ||
    oldFixture.elapsed !== newFixture.elapsed
  ) {
    touched = true;
    changes.push({
      type: REALTIME_EVENTS.FIXTURE_STATUS,
      payload: {
        fixtureId: newFixture.id,
        status: newFixture.status,
        elapsed: newFixture.elapsed,
        previousStatus: oldFixture.status,
        changedAt,
      },
    });
  }

  const newEvents = findNewEvents(oldFixture.events, newFixture.events);

  for (const event of newEvents) {
    touched = true;
    if (event.type === "Goal") {
      changes.push({
        type: REALTIME_EVENTS.FIXTURE_GOAL,
        payload: {
          fixtureId: newFixture.id,
          event,
          goals: newFixture.goals,
          homeTeamId: newFixture.home.id,
          awayTeamId: newFixture.away.id,
          changedAt,
        },
      });
    } else if (event.type === "Card") {
      changes.push({
        type: REALTIME_EVENTS.FIXTURE_CARD,
        payload: {
          fixtureId: newFixture.id,
          event,
          changedAt,
        },
      });
    } else if (event.type === "subst") {
      changes.push({
        type: REALTIME_EVENTS.FIXTURE_SUBSTITUTION,
        payload: {
          fixtureId: newFixture.id,
          event,
          changedAt,
        },
      });
    }
  }

  const scoreChanged =
    oldFixture.goals.home !== newFixture.goals.home ||
    oldFixture.goals.away !== newFixture.goals.away;

  if (scoreChanged) {
    touched = true;
  }

  if (touched) {
    changes.push({
      type: REALTIME_EVENTS.FIXTURE_UPDATED,
      payload: { fixture: newFixture, changedAt },
    });
  }

  return changes;
}

export interface SyncLiveResult {
  fixtures: Fixture[];
  changes: DetectedChange[];
  syncedAt: string;
}

/**
 * Fetches fresh live fixtures, compares against the previous cached snapshot,
 * invalidates the live cache, and returns detected realtime changes.
 */
export async function syncLiveFixtures(
  previousFixtures?: Fixture[],
): Promise<SyncLiveResult> {
  const previous =
    previousFixtures ??
    (await getCachedLiveFixtures().catch(() => [] as Fixture[]));

  invalidateFootballCache("football:live");
  invalidateFootballCache("football:fixture:*");

  const fixtures = await getFootballService().getLiveFixtures();
  const previousById = new Map(previous.map((f) => [f.id, f]));

  const changes: DetectedChange[] = [];
  for (const fixture of fixtures) {
    changes.push(...detectChanges(previousById.get(fixture.id), fixture));
  }

  return {
    fixtures,
    changes,
    syncedAt: new Date().toISOString(),
  };
}

export function summarizeChanges(changes: DetectedChange[]): {
  goals: number;
  cards: number;
  substitutions: number;
  statusUpdates: number;
  updates: number;
} {
  return {
    goals: changes.filter((c) => c.type === REALTIME_EVENTS.FIXTURE_GOAL).length,
    cards: changes.filter((c) => c.type === REALTIME_EVENTS.FIXTURE_CARD).length,
    substitutions: changes.filter(
      (c) => c.type === REALTIME_EVENTS.FIXTURE_SUBSTITUTION,
    ).length,
    statusUpdates: changes.filter(
      (c) => c.type === REALTIME_EVENTS.FIXTURE_STATUS,
    ).length,
    updates: changes.filter((c) => c.type === REALTIME_EVENTS.FIXTURE_UPDATED)
      .length,
  };
}

export type { RealtimePayload };
