"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SearchCommand } from "@/components/search/SearchCommand";
import { RealtimeBridge } from "@/components/providers/RealtimeBridge";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <QueryProvider>
          <TooltipProvider delayDuration={200}>
            <RealtimeBridge />
            {children}
            <SearchCommand />
            <Toaster
              theme="system"
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                classNames: {
                  toast:
                    "border border-border bg-card text-card-foreground shadow-md",
                },
              }}
            />
          </TooltipProvider>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
