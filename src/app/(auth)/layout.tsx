import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(14,18,24,0.9),_transparent_60%)]"
      />
      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-live/15">
              <span className="h-2.5 w-2.5 rounded-full bg-live animate-live-pulse" />
            </span>
            <span className="text-2xl font-bold tracking-tight">GoalPulse</span>
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Every match. Every moment.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
