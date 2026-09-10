import { getFootballService } from "@/lib/football";
import { err, ok, zodErr } from "@/lib/api/response";
import { z } from "zod";

const h2hQuerySchema = z.object({
  team1: z.coerce.number().int().positive(),
  team2: z.coerce.number().int().positive(),
  last: z.coerce.number().int().positive().max(20).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = h2hQuerySchema.safeParse({
      team1: searchParams.get("team1"),
      team2: searchParams.get("team2"),
      last: searchParams.get("last") || undefined,
    });
    if (!parsed.success) return zodErr(parsed.error);

    const service = getFootballService();
    const fixtures = await service.getHeadToHead(
      parsed.data.team1,
      parsed.data.team2,
      parsed.data.last ?? 10,
    );

    return ok(fixtures);
  } catch (error) {
    console.error("[api/fixtures/h2h]", error);
    return err("Failed to load head-to-head", 500, { code: "H2H_ERROR" });
  }
}
