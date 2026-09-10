import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <WifiOff className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">You’re offline</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Scores can’t refresh without a connection. Reconnect to get live
        updates.
      </p>
      <Button asChild>
        <Link href="/">Retry home</Link>
      </Button>
    </div>
  );
}
