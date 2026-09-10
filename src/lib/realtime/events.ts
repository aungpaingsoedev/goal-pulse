import type { Fixture, MatchEvent } from "@/types/football";

export const REALTIME_EVENTS = {
  FIXTURE_UPDATED: "fixture:updated",
  FIXTURE_GOAL: "fixture:goal",
  FIXTURE_CARD: "fixture:card",
  FIXTURE_SUBSTITUTION: "fixture:substitution",
  FIXTURE_STATUS: "fixture:status",
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export interface FixtureUpdatedPayload {
  fixture: Fixture;
  changedAt: string;
}

export interface FixtureGoalPayload {
  fixtureId: number;
  event: MatchEvent;
  goals: Fixture["goals"];
  homeTeamId: number;
  awayTeamId: number;
  changedAt: string;
}

export interface FixtureCardPayload {
  fixtureId: number;
  event: MatchEvent;
  changedAt: string;
}

export interface FixtureSubstitutionPayload {
  fixtureId: number;
  event: MatchEvent;
  changedAt: string;
}

export interface FixtureStatusPayload {
  fixtureId: number;
  status: Fixture["status"];
  elapsed: number | null;
  previousStatus: Fixture["status"];
  changedAt: string;
}

export type RealtimeEventPayloadMap = {
  [REALTIME_EVENTS.FIXTURE_UPDATED]: FixtureUpdatedPayload;
  [REALTIME_EVENTS.FIXTURE_GOAL]: FixtureGoalPayload;
  [REALTIME_EVENTS.FIXTURE_CARD]: FixtureCardPayload;
  [REALTIME_EVENTS.FIXTURE_SUBSTITUTION]: FixtureSubstitutionPayload;
  [REALTIME_EVENTS.FIXTURE_STATUS]: FixtureStatusPayload;
};

export type RealtimePayload =
  RealtimeEventPayloadMap[keyof RealtimeEventPayloadMap];
