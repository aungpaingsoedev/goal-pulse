import type { MetadataRoute } from "next";
import { POPULAR_LEAGUES } from "@/lib/football/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticRoutes = [
    "",
    "/live",
    "/matches",
    "/leagues",
    "/standings",
    "/teams",
    "/players",
    "/favorites",
    "/search",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const leagueRoutes = POPULAR_LEAGUES.map((league) => ({
    url: `${base}/leagues/${league.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...leagueRoutes];
}
