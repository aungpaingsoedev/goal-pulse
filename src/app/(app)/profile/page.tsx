"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const profile = session?.user
    ? {
        email: session.user.email ?? "Signed in",
        displayName:
          session.user.name ||
          session.user.email?.split("@")[0] ||
          "Fan",
        avatarUrl: session.user.image,
        role: session.user.role,
      }
    : null;

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
    toast.success("Signed out");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your GoalPulse account."
      />

      {loading ? (
        <div className="h-28 animate-pulse rounded-xl border border-border bg-muted" />
      ) : !profile ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to sync favorites and notifications.
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback>
                {profile.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold">{profile.displayName}</p>
              <p className="truncate text-sm text-muted-foreground">
                {profile.email}
              </p>
              {profile.role === "admin" ? (
                <p className="mt-1 text-xs text-live">Admin</p>
              ) : null}
            </div>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/favorites">Favorites</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">Settings</Link>
            </Button>
            {profile.role === "admin" ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleSignOut()}
            >
              Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
