import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { User, SupabaseClient } from "@supabase/supabase-js";

export type AuthContext = {
  user: User;
  supabase: SupabaseClient;
};

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function isMockMode(): boolean {
  return (
    process.env.USE_MOCK_DATA === "true" || !process.env.FOOTBALL_API_KEY
  );
}

/**
 * Returns authenticated user + supabase client, or null when
 * auth/env is unavailable (never throws for missing config).
 */
export async function getOptionalAuth(): Promise<AuthContext | null> {
  if (!hasSupabaseEnv()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return { user, supabase };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthContext | null> {
  return getOptionalAuth();
}

export type AdminGate =
  | { ok: true; ctx: AuthContext | null; bypass: boolean }
  | { ok: false; reason: "unauthorized" | "forbidden" | "unavailable" };

/**
 * Admin gate for sync/stats. In mock mode without Supabase, allows bypass.
 */
export async function requireAdmin(): Promise<AdminGate> {
  if (!hasSupabaseEnv()) {
    if (isMockMode()) {
      return { ok: true, ctx: null, bypass: true };
    }
    return { ok: false, reason: "unavailable" };
  }

  const ctx = await getOptionalAuth();
  if (!ctx) return { ok: false, reason: "unauthorized" };

  try {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("role")
      .eq("id", ctx.user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      return { ok: true, ctx, bypass: false };
    }

    if (isMockMode() && !profile) {
      return { ok: true, ctx, bypass: true };
    }

    return { ok: false, reason: "forbidden" };
  } catch {
    if (isMockMode()) return { ok: true, ctx, bypass: true };
    return { ok: false, reason: "unavailable" };
  }
}
