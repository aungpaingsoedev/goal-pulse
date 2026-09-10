"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, Play, Radio, Tv } from "lucide-react";
import { EmptyState } from "@/components/football/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MatchStream } from "@/types/football";

function toEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (
      u.hostname.includes("youtube.com") ||
      u.hostname.includes("youtu.be")
    ) {
      if (u.pathname.startsWith("/embed/")) return url;
      const id =
        u.hostname.includes("youtu.be")
          ? u.pathname.slice(1)
          : u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    // Direct embed pages / HLS players served as https pages
    if (url.includes("/embed") || url.includes("player")) return url;
  } catch {
    return null;
  }
  return null;
}

function streamIcon(type: MatchStream["type"]) {
  if (type === "tv") return Tv;
  if (type === "highlight") return Play;
  return Radio;
}

export function LiveVideoPanel({
  streams,
  isLive,
  className,
}: {
  streams: MatchStream[];
  isLive?: boolean;
  className?: string;
}) {
  const playable = useMemo(
    () =>
      streams.filter((s) => {
        const embed = toEmbedUrl(s.url);
        return Boolean(embed);
      }),
    [streams],
  );

  const [activeId, setActiveId] = useState<string | number | null>(
    playable[0]?.id ?? null,
  );

  const active = streams.find((s) => s.id === activeId) ?? playable[0] ?? null;
  const embedUrl = active ? toEmbedUrl(active.url) : null;

  if (!streams.length) {
    return (
      <EmptyState
        title="No live video available"
        description={
          isLive
            ? "TV and stream listings aren’t available for this match yet."
            : "Streams and broadcasters appear when Sportmonks provides TV data."
        }
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {embedUrl ? (
        <div className="overflow-hidden rounded-xl border border-border bg-black">
          <div className="relative aspect-video w-full">
            <iframe
              key={String(active?.id)}
              src={embedUrl}
              title={active?.name ?? "Match video"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          {active ? (
            <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {active.name}
                </p>
                <p className="text-[11px] text-white/60 capitalize">
                  {active.type}
                  {active.country ? ` · ${active.country}` : ""}
                </p>
              </div>
              {isLive ? <Badge variant="live">LIVE</Badge> : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
          <Play className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No embeddable stream</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Open a broadcaster link below to watch where rights allow.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Where to watch
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {streams.map((stream) => {
            const Icon = streamIcon(stream.type);
            const embed = toEmbedUrl(stream.url);
            const selected = active?.id === stream.id;
            return (
              <li key={String(stream.id)}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border bg-card p-3",
                    selected && embed && "border-live/40",
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {stream.logo ? (
                      <Image
                        src={stream.logo}
                        alt=""
                        width={40}
                        height={40}
                        className="h-full w-full object-contain"
                        unoptimized
                      />
                    ) : (
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{stream.name}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {stream.type}
                      {stream.country ? ` · ${stream.country}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {embed ? (
                      <Button
                        size="sm"
                        variant={selected ? "default" : "secondary"}
                        className="h-8"
                        onClick={() => setActiveId(stream.id)}
                      >
                        Watch
                      </Button>
                    ) : null}
                    {stream.url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        asChild
                      >
                        <a
                          href={stream.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${stream.name}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        TV
                      </Badge>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
