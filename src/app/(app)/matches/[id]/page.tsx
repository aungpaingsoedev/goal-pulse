import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFootballService } from "@/lib/football";
import { MatchCenter } from "./MatchCenter";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId)) {
    return { title: "Match" };
  }

  try {
    const fixture = await getFootballService().getFixtureById(fixtureId);
    if (!fixture) return { title: "Match not found" };

    const liveish = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(
      fixture.status,
    );
    const title = `${fixture.home.name} vs ${fixture.away.name}${liveish ? " Live Score" : ""}`;

    return {
      title,
      description: `${fixture.league.name}${fixture.league.round ? ` · ${fixture.league.round}` : ""} — GoalPulse`,
    };
  } catch {
    return { title: "Match" };
  }
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params;
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId) || fixtureId <= 0) notFound();

  return <MatchCenter fixtureId={fixtureId} />;
}
