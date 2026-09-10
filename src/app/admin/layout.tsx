import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/fixtures", label: "Fixtures" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/leagues", label: "Leagues" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/sync", label: "Sync" },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-bold tracking-tight">
              GoalPulse Admin
            </Link>
            <span className="rounded-md bg-warning/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-warning uppercase">
              Ops
            </span>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← App
          </Link>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {adminNav.map((item) => (
            <AdminNavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

function AdminNavLink({ href, label }: { href: string; label: string }) {
  // Client-less active state via CSS is awkward; keep simple links.
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
