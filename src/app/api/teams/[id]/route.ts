import {
  getCachedFixturesByDate,
  getCachedTeamById,
} from "@/lib/cache/football-cache";
import { err, ok, zodErr } from "@/lib/api/response";
import { idParamSchema } from "@/lib/validation/schemas";
import type { Fixture } from "@/types/football";

type RouteContext = { params: Promise<{ id: string }> };

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

async function fixturesAroundTeam(teamId: number): Promise<{
  recent: Fixture[];
  next: Fixture[];
}> {
  const today = new Date();
  const dates = Array.from({ length: 9 }, (_, i) => ymd(addDays(today, i - 4)));

  const batches = await Promise.all(
    dates.map((date) => getCachedFixturesByDate(date).catch(() => [] as Fixture[])),
  );

  const related = batches
    .flat()
    .filter((f) => f.home.id === teamId || f.away.id === teamId)
    .sort((a, b) => a.timestamp - b.timestamp);

  const now = Math.floor(Date.now() / 1000);
  const recent = related.filter((f) => f.timestamp < now).slice(-5).reverse();
  const next = related.filter((f) => f.timestamp >= now).slice(0, 5);

  return { recent, next };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const parsed = idParamSchema.safeParse(rawId);
    if (!parsed.success) return zodErr(parsed.error);

    const team = await getCachedTeamById(parsed.data);
    if (!team) {
      return err("Team not found", 404, { code: "NOT_FOUND" });
    }

    const { recent, next } = await fixturesAroundTeam(team.id);

    return ok({ team, recent, next });
  } catch (error) {
    console.error("[api/teams/[id]]", error);
    return err("Failed to load team", 500, { code: "TEAM_ERROR" });
  }
}
