"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  query?: string;
  onQueryChange?: (value: string) => void;
  placeholder?: string;
  filters?: Array<{
    id: string;
    label: string;
    value?: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
  onClear?: () => void;
  className?: string;
  children?: ReactNode;
}

export function FilterBar({
  query,
  onQueryChange,
  placeholder = "Filter…",
  filters = [],
  onClear,
  className,
  children,
}: FilterBarProps) {
  const hasClear =
    onClear &&
    (Boolean(query) || filters.some((f) => f.value && f.value !== "all"));

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      {onQueryChange ? (
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query ?? ""}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="pl-8"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={filter.value ?? "all"}
            onValueChange={filter.onChange}
          >
            <SelectTrigger className="w-[150px]" aria-label={filter.label}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {children}
        {hasClear ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
