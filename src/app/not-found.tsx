import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="font-mono text-sm text-live">404</p>
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That route doesn’t exist — or the match has already left the pitch.
      </p>
      <Button asChild>
        <Link href="/">Back to GoalPulse</Link>
      </Button>
    </div>
  );
}
