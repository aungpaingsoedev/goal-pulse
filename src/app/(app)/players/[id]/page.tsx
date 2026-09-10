import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFootballService } from "@/lib/football";
import { PlayerDetail } from "./PlayerDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isFinite(playerId)) return { title: "Player" };

  try {
    const player = await getFootballService().getPlayerById(playerId);
    if (!player) return { title: "Player not found" };
    return {
      title: player.name,
      description: `${player.name}${player.team?.name ? ` · ${player.team.name}` : ""} — GoalPulse`,
    };
  } catch {
    return { title: "Player" };
  }
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isFinite(playerId) || playerId <= 0) notFound();

  return <PlayerDetail playerId={playerId} />;
}
