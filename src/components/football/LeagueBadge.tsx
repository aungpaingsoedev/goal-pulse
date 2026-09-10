import Image from "next/image";
import { cn } from "@/lib/utils";
import type { League } from "@/types/football";

export interface LeagueBadgeProps {
  league: Pick<League, "id" | "name" | "logo" | "country">;
  showName?: boolean;
  className?: string;
  size?: number;
}

export function LeagueBadge({
  league,
  showName = true,
  className,
  size = 16,
}: LeagueBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <span
        className="relative inline-flex shrink-0 overflow-hidden rounded-sm bg-muted"
        style={{ width: size, height: size }}
      >
        <Image
          src={league.logo}
          alt={league.name}
          width={size}
          height={size}
          className="object-contain"
          unoptimized
        />
      </span>
      {showName ? (
        <span className="truncate font-medium text-foreground/80">
          {league.name}
          {league.country ? (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {league.country}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
