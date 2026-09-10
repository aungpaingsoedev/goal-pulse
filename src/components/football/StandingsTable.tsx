import { TeamLogo } from "@/components/football/TeamLogo";
import { cn } from "@/lib/utils";
import type { Standing } from "@/types/football";

export interface StandingsTableProps {
  standings: Standing[];
  favoriteTeamId?: number | null;
  className?: string;
}

function FormPips({ form }: { form: string | null }) {
  if (!form) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex gap-0.5">
      {form
        .slice(-5)
        .split("")
        .map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded-sm text-[9px] font-bold",
              ch === "W" && "bg-live/20 text-live",
              ch === "D" && "bg-muted text-muted-foreground",
              ch === "L" && "bg-destructive/20 text-destructive",
            )}
          >
            {ch}
          </span>
        ))}
    </span>
  );
}

export function StandingsTable({
  standings,
  favoriteTeamId,
  className,
}: StandingsTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Team</th>
            <th className="px-2 py-2 text-center font-medium">P</th>
            <th className="px-2 py-2 text-center font-medium">W</th>
            <th className="px-2 py-2 text-center font-medium">D</th>
            <th className="px-2 py-2 text-center font-medium">L</th>
            <th className="px-2 py-2 text-center font-medium">GD</th>
            <th className="px-2 py-2 text-center font-medium">Pts</th>
            <th className="px-3 py-2 font-medium">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => {
            const isFavorite = favoriteTeamId === row.team.id;
            return (
              <tr
                key={`${row.leagueId}-${row.team.id}-${row.rank}`}
                className={cn(
                  "border-b border-border/70 last:border-0",
                  isFavorite && "bg-primary/10",
                )}
              >
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                  {row.rank}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <TeamLogo
                      src={row.team.logo}
                      name={row.team.name}
                      size={20}
                    />
                    <span
                      className={cn(
                        "font-medium",
                        isFavorite && "text-primary",
                      )}
                    >
                      {row.team.name}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">
                  {row.all.played}
                </td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">
                  {row.all.win}
                </td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">
                  {row.all.draw}
                </td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">
                  {row.all.lose}
                </td>
                <td className="px-2 py-2 text-center font-mono tabular-nums">
                  {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                </td>
                <td className="px-2 py-2 text-center font-mono text-sm font-bold tabular-nums">
                  {row.points}
                </td>
                <td className="px-3 py-2">
                  <FormPips form={row.form} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
