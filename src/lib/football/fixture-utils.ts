import {
  FINISHED_STATUSES,
  LIVE_STATUSES,
  type Fixture,
  type FixtureStatus,
  type LiveFixtureGroup,
} from "@/types/football";

export function isLiveStatus(status: FixtureStatus): boolean {
  return LIVE_STATUSES.includes(status);
}

export function isFinishedStatus(status: FixtureStatus): boolean {
  return FINISHED_STATUSES.includes(status);
}

export function isUpcomingStatus(status: FixtureStatus): boolean {
  return !isLiveStatus(status) && !isFinishedStatus(status);
}

export function groupFixturesByLeague(fixtures: Fixture[]): LiveFixtureGroup[] {
  const map = new Map<number, LiveFixtureGroup>();

  for (const fixture of fixtures) {
    const existing = map.get(fixture.league.id);
    if (existing) {
      existing.fixtures.push(fixture);
      continue;
    }
    map.set(fixture.league.id, {
      league: fixture.league,
      fixtures: [fixture],
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    a.league.name.localeCompare(b.league.name),
  );
}

export function splitFixturesByPhase(fixtures: Fixture[]) {
  return {
    live: fixtures.filter((f) => isLiveStatus(f.status)),
    upcoming: fixtures.filter((f) => isUpcomingStatus(f.status)),
    finished: fixtures.filter((f) => isFinishedStatus(f.status)),
  };
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
