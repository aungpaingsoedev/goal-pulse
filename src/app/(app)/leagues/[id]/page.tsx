import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFootballService } from "@/lib/football";
import { LeagueDetail } from "./LeagueDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const leagueId = Number(id);
  if (!Number.isFinite(leagueId)) return { title: "League" };

  try {
    const league = await getFootballService().getLeagueById(leagueId);
    if (!league) return { title: "League not found" };
    return {
      title: league.name,
      description: `${league.name} standings, fixtures, and scorers — GoalPulse`,
    };
  } catch {
    return { title: "League" };
  }
}

export default async function LeaguePage({ params }: PageProps) {
  const { id } = await params;
  const leagueId = Number(id);
  if (!Number.isFinite(leagueId) || leagueId <= 0) notFound();

  return <LeagueDetail leagueId={leagueId} />;
}
