"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FavoriteButtonProps {
  active?: boolean;
  onToggle?: () => void;
  className?: string;
  size?: "sm" | "default" | "icon";
  disabled?: boolean;
  "aria-label"?: string;
}

export function FavoriteButton({
  active = false,
  onToggle,
  className,
  size = "icon",
  disabled,
  "aria-label": ariaLabel = active ? "Remove favorite" : "Add favorite",
}: FavoriteButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle?.();
      }}
      className={cn("text-muted-foreground hover:text-destructive", className)}
    >
      <motion.span
        key={active ? "on" : "off"}
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="inline-flex"
      >
        <Heart
          className={cn(
            "h-4 w-4",
            active && "fill-destructive text-destructive",
          )}
        />
      </motion.span>
    </Button>
  );
}
