"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ScoreDisplayProps {
  home: number | null;
  away: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  separator?: string;
}

function ScoreDigit({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  const display = value === null ? "–" : String(value);
  return (
    <span className={cn("relative inline-flex min-w-[1ch] justify-center", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          initial={{ y: 8, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -8, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="inline-block tabular-nums"
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const sizeClass = {
  sm: "text-sm font-semibold gap-1",
  md: "text-lg font-bold gap-1.5",
  lg: "text-3xl font-bold gap-2 tracking-tight",
} as const;

export function ScoreDisplay({
  home,
  away,
  size = "md",
  className,
  separator = "–",
}: ScoreDisplayProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center font-mono text-foreground",
        sizeClass[size],
        className,
      )}
      aria-label={`Score ${home ?? "-"} to ${away ?? "-"}`}
    >
      <ScoreDigit value={home} />
      <span className="text-muted-foreground">{separator}</span>
      <ScoreDigit value={away} />
    </div>
  );
}
