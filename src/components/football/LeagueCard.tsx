import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { League } from "@/types/football";

export interface LeagueCardProps {
  league: League;
  className?: string;
  href?: string;
}

export function LeagueCard({ league, className, href }: LeagueCardProps) {
  return (
    <Link
      href={href ?? `/leagues/${league.id}`}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-colors hover:bg-muted/40",
        className,
      )}
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted p-1">
        <Image
          src={league.logo}
          alt={league.name}
          width={40}
          height={40}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{league.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {league.country}
          {league.season ? ` · ${league.season}` : ""}
          {league.round ? ` · ${league.round}` : ""}
        </p>
      </div>
    </Link>
  );
}
