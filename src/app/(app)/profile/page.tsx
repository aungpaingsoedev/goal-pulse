"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

type ProfileView = {
  email: string;
  displayName: string;
  avatarUrl?: string | null;
};

function supabaseReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabaseReady()) {
        setLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setProfile(null);
          return;
        }
        setProfile({
          email: user.email ?? "Signed in",
          displayName:
            (user.user_metadata?.full_name as string | undefined) ||
            (user.user_metadata?.name as string | undefined) ||
            user.email?.split("@")[0] ||
            "Fan",
          avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        });
      } catch {
        if (!cancelled) {
          toast.message("Supabase isn’t configured");
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function signOut() {
    if (!supabaseReady()) {
      toast.message("Supabase isn’t configured");
      return;
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setProfile(null);
      toast.success("Signed out");
    } catch {
      toast.message("Supabase isn’t configured");
    }
  }

  const initials =
    profile?.displayName
      ?.split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GP";

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" description="Your GoalPulse account." />

      <div className="rounded-xl border border-border bg-card p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : profile ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold">{profile.displayName}</h2>
              <p className="truncate text-sm text-muted-foreground">
                {profile.email}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You’re browsing as a guest. Sign in to sync favorites and alerts.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          </div>
        )}

        <Separator className="my-5" />

        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <Link href="/favorites" className="rounded-md px-2 py-2 hover:bg-secondary">
            Favorites
          </Link>
          <Link href="/settings" className="rounded-md px-2 py-2 hover:bg-secondary">
            Settings
          </Link>
          <Link href="/notifications" className="rounded-md px-2 py-2 hover:bg-secondary">
            Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
