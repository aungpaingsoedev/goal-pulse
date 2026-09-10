import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { type NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

/**
 * Next.js 16 uses `proxy.ts` (middleware renamed).
 * Gates /admin using JWT session (edge-safe Auth.js config).
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const session = await auth();
  const mockMode =
    process.env.USE_MOCK_DATA === "true" ||
    !(process.env.SPORTMONKS_API_TOKEN || process.env.FOOTBALL_API_KEY);

  if (!session?.user) {
    if (mockMode) return NextResponse.next();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session.user as { role?: string }).role;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = (session.user.email ?? "").toLowerCase();
  const isAdmin = role === "admin" || adminEmails.includes(email);

  if (!isAdmin && !mockMode) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
