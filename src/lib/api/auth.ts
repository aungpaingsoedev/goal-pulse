import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
};

export type AuthContext = {
  user: AuthUser;
};

function isMockMode(): boolean {
  return (
    process.env.USE_MOCK_DATA === "true" ||
    !(process.env.SPORTMONKS_API_TOKEN || process.env.FOOTBALL_API_KEY)
  );
}

/**
 * Returns the authenticated user, or null when unauthenticated.
 */
export async function getOptionalAuth(): Promise<AuthContext | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    return {
      user: {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name,
        image: session.user.image,
        role: session.user.role ?? "user",
      },
    };
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
 * Admin gate for sync/stats. In mock mode without a session, allows bypass
 * for local development.
 */
export async function requireAdmin(): Promise<AdminGate> {
  const ctx = await getOptionalAuth();

  if (!ctx) {
    if (isMockMode()) {
      return { ok: true, ctx: null, bypass: true };
    }
    return { ok: false, reason: "unauthorized" };
  }

  try {
    const profile = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { role: true, email: true },
    });

    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin =
      profile?.role === "admin" ||
      adminEmails.includes((profile?.email ?? ctx.user.email).toLowerCase());

    if (isAdmin) {
      return { ok: true, ctx, bypass: false };
    }

    if (isMockMode()) {
      return { ok: true, ctx, bypass: true };
    }

    return { ok: false, reason: "forbidden" };
  } catch {
    if (isMockMode()) return { ok: true, ctx, bypass: true };
    return { ok: false, reason: "unavailable" };
  }
}
