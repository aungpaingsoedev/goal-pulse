import Link from "next/link";
import { TeamLogo } from "@/components/football/TeamLogo";
import { cn } from "@/lib/utils";
import type { Team } from "@/types/football";

export interface TeamCardProps {
  team: Team;
  className?: string;
  href?: string;
}

export function TeamCard({ team, className, href }: TeamCardProps) {
  return (
    <Link
      href={href ?? `/teams/${team.id}`}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-colors hover:bg-muted/40",
        className,
      )}
    >
      <TeamLogo src={team.logo} name={team.name} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{team.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[team.code, team.country].filter(Boolean).join(" · ") || "Club"}
          {team.founded ? ` · Est. ${team.founded}` : ""}
        </p>
      </div>
    </Link>
  );
}
