"use client";

import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DateSelectorProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

function dayLabel(date: Date, today: Date) {
  if (isSameDay(date, addDays(today, -1))) return "Yesterday";
  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, addDays(today, 1))) return "Tomorrow";
  return format(date, "EEE d MMM");
}

export function DateSelector({ value, onChange, className }: DateSelectorProps) {
  const today = startOfDay(new Date());
  const selected = startOfDay(value);
  const presets = [addDays(today, -1), today, addDays(today, 1)];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Previous day"
          onClick={() => onChange(addDays(selected, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="inline-flex min-w-[9.5rem] items-center justify-center gap-1.5 px-2 font-medium">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{dayLabel(selected, today)}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Next day"
          onClick={() => onChange(addDays(selected, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        {presets.map((d) => {
          const active = isSameDay(d, selected);
          return (
            <Button
              key={d.toISOString()}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() => onChange(d)}
            >
              {dayLabel(d, today)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
