import { StatBar } from "@/components/football/StatBar";
import { TeamLogo } from "@/components/football/TeamLogo";
import { cn } from "@/lib/utils";
import type { MatchStatistics } from "@/types/football";

export interface StatComparisonProps {
  statistics: MatchStatistics[];
  className?: string;
}

function numericValue(value: number | string | null): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const cleaned = value.replace("%", "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function StatComparison({ statistics, className }: StatComparisonProps) {
  if (statistics.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">Statistics unavailable.</p>
    );
  }

  const [home, away] = statistics;
  const types = home.statistics.map((s) => s.type);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TeamLogo src={home.team.logo} name={home.team.name} size={22} />
          <span className="text-sm font-medium">{home.team.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{away.team.name}</span>
          <TeamLogo src={away.team.logo} name={away.team.name} size={22} />
        </div>
      </div>

      <div className="space-y-3">
        {types.map((type) => {
          const homeStat = home.statistics.find((s) => s.type === type);
          const awayStat = away.statistics.find((s) => s.type === type);
          return (
            <StatBar
              key={type}
              label={type}
              homeValue={numericValue(homeStat?.value ?? 0)}
              awayValue={numericValue(awayStat?.value ?? 0)}
            />
          );
        })}
      </div>
    </div>
  );
}
