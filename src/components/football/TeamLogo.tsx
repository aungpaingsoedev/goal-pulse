"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface TeamLogoProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function TeamLogo({
  src,
  name,
  size = 28,
  className,
  priority,
}: TeamLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size }}
      title={name}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={name}
          width={size}
          height={size}
          className="object-contain p-0.5"
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="font-semibold leading-none"
          style={{ fontSize: Math.max(10, size * 0.32) }}
        >
          {initialsFromName(name)}
        </span>
      )}
    </div>
  );
}
