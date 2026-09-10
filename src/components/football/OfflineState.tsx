"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface OfflineStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function OfflineState({
  title = "You're offline",
  description = "Check your connection. Live scores and updates will resume when you're back online.",
  onRetry,
  className,
}: OfflineStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-3 rounded-full bg-warning/15 p-3 text-warning">
        <WifiOff className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
