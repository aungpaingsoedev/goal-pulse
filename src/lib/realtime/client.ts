"use client";

import { io, type Socket } from "socket.io-client";
import {
  REALTIME_EVENTS,
  type RealtimeEventName,
  type RealtimeEventPayloadMap,
} from "@/lib/realtime/events";

let socket: Socket | null = null;

export function getRealtimeSocket(): Socket | null {
  return socket;
}

/** Socket.IO is opt-in — avoid noisy WS errors when no realtime server is running. */
export function isRealtimeEnabled(): boolean {
  if (typeof process === "undefined") return false;
  if (process.env.NEXT_PUBLIC_REALTIME_ENABLED === "true") return true;
  return Boolean(process.env.NEXT_PUBLIC_REALTIME_URL);
}

export function connectRealtime(url?: string): Socket {
  if (typeof window === "undefined") {
    throw new Error("connectRealtime() can only be called in the browser");
  }

  if (!isRealtimeEnabled() && !url) {
    throw new Error("Realtime is disabled");
  }

  if (socket?.connected) {
    return socket;
  }

  const baseUrl =
    url ??
    process.env.NEXT_PUBLIC_REALTIME_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    window.location.origin;

  socket = io(baseUrl, {
    path: "/api/socket",
    autoConnect: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
  });

  return socket;
}

export function disconnectRealtime(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function subscribeToFixture<E extends RealtimeEventName>(
  fixtureId: number,
  event: E,
  handler: (payload: RealtimeEventPayloadMap[E]) => void,
): () => void {
  const client = socket ?? connectRealtime();
  const room = `fixture:${fixtureId}`;

  client.emit("subscribe", { room });

  const listener = (payload: RealtimeEventPayloadMap[E]) => {
    const id =
      "fixtureId" in payload
        ? payload.fixtureId
        : "fixture" in payload
          ? payload.fixture.id
          : null;

    if (id === fixtureId) {
      handler(payload);
    }
  };

  client.on(event, listener as never);

  return () => {
    client.off(event, listener as never);
    client.emit("unsubscribe", { room });
  };
}

export function subscribeToAllFixtures(
  handler: (event: RealtimeEventName, payload: unknown) => void,
): () => void {
  const client = socket ?? connectRealtime();
  const events = Object.values(REALTIME_EVENTS);
  const listeners = events.map((event) => {
    const listener = (payload: unknown) => handler(event, payload);
    client.on(event, listener);
    return { event, listener };
  });

  return () => {
    listeners.forEach(({ event, listener }) => {
      client.off(event, listener);
    });
  };
}
