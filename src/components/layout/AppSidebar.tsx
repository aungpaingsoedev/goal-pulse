"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Heart,
  LayoutDashboard,
  Search,
  Settings,
  ListOrdered,
  Shirt,
  Trophy,
  Users,
  CalendarDays,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const primaryNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live", label: "Live", icon: Activity },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/leagues", label: "Leagues", icon: Trophy },
  { href: "/teams", label: "Teams", icon: Shirt },
  { href: "/players", label: "Players", icon: Users },
  { href: "/standings", label: "Standings", icon: ListOrdered },
  { href: "/favorites", label: "Favorites", icon: Heart },
] as const;

const bottomNav = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className={cn(
        "hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-card md:flex",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-live/15">
          <span className="h-2.5 w-2.5 rounded-full bg-live animate-live-pulse" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight">
            GoalPulse
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            Live football, sharp scores
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {primaryNav.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
          />
        ))}
      </nav>

      <div className="mt-auto space-y-2 px-2 pb-4">
        <Separator />
        <div className="space-y-0.5">
          {bottomNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </div>
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
