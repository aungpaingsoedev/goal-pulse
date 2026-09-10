import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main
          className={cn(
            "mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-20 md:px-6 md:pb-6",
            className,
          )}
        >
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
