import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFootballService } from "@/lib/football";
import { TeamDetail } from "./TeamDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const teamId = Number(id);
  if (!Number.isFinite(teamId)) return { title: "Team" };

  try {
    const team = await getFootballService().getTeamById(teamId);
    if (!team) return { title: "Team not found" };
    return {
      title: team.name,
      description: `${team.name} fixtures, squad, and form — GoalPulse`,
    };
  } catch {
    return { title: "Team" };
  }
}

export default async function TeamPage({ params }: PageProps) {
  const { id } = await params;
  const teamId = Number(id);
  if (!Number.isFinite(teamId) || teamId <= 0) notFound();

  return <TeamDetail teamId={teamId} />;
}
