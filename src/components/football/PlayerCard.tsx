import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Player } from "@/types/football";

export interface PlayerCardProps {
  player: Player;
  className?: string;
  href?: string;
}

export function PlayerCard({ player, className, href }: PlayerCardProps) {
  const content = (
    <>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={player.photo}
          alt={player.name}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{player.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[player.position, player.nationality, player.team?.name]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {player.number != null ? (
        <span className="font-mono text-lg font-bold text-muted-foreground">
          #{player.number}
        </span>
      ) : null}
    </>
  );

  const classes = cn(
    "flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-colors hover:bg-muted/40",
    className,
  );

  return (
    <Link href={href ?? `/players/${player.id}`} className={classes}>
      {content}
    </Link>
  );
}
