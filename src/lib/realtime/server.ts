import "server-only";

import type { Server as HTTPServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import {
  REALTIME_EVENTS,
  type FixtureUpdatedPayload,
  type FixtureGoalPayload,
  type FixtureCardPayload,
  type FixtureSubstitutionPayload,
  type FixtureStatusPayload,
} from "@/lib/realtime/events";

declare global {
  var __goalpulseIo: SocketIOServer | undefined;
}

export function getRealtimeServer(httpServer?: HTTPServer): SocketIOServer {
  if (globalThis.__goalpulseIo) return globalThis.__goalpulseIo;

  const io = new SocketIOServer(httpServer ?? undefined, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("fixture:subscribe", (fixtureId: number) => {
      socket.join(`fixture:${fixtureId}`);
    });
    socket.on("fixture:unsubscribe", (fixtureId: number) => {
      socket.leave(`fixture:${fixtureId}`);
    });
  });

  globalThis.__goalpulseIo = io;
  return io;
}

export function emitFixtureUpdated(payload: FixtureUpdatedPayload) {
  globalThis.__goalpulseIo?.emit(REALTIME_EVENTS.FIXTURE_UPDATED, payload);
  globalThis.__goalpulseIo
    ?.to(`fixture:${payload.fixture.id}`)
    .emit(REALTIME_EVENTS.FIXTURE_UPDATED, payload);
}

export function emitFixtureGoal(payload: FixtureGoalPayload) {
  globalThis.__goalpulseIo?.emit(REALTIME_EVENTS.FIXTURE_GOAL, payload);
}

export function emitFixtureCard(payload: FixtureCardPayload) {
  globalThis.__goalpulseIo?.emit(REALTIME_EVENTS.FIXTURE_CARD, payload);
}

export function emitFixtureSubstitution(payload: FixtureSubstitutionPayload) {
  globalThis.__goalpulseIo?.emit(REALTIME_EVENTS.FIXTURE_SUBSTITUTION, payload);
}

export function emitFixtureStatus(payload: FixtureStatusPayload) {
  globalThis.__goalpulseIo?.emit(REALTIME_EVENTS.FIXTURE_STATUS, payload);
}
