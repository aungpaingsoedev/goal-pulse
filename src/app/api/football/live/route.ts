import { getCachedLiveFixtures } from "@/lib/cache/football-cache";
import { err, ok } from "@/lib/api/response";

export async function GET() {
  try {
    const fixtures = await getCachedLiveFixtures();
    return ok(fixtures);
  } catch (error) {
    console.error("[api/football/live]", error);
    return err("Failed to load live fixtures", 500, { code: "LIVE_ERROR" });
  }
}
