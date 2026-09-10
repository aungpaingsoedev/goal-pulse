import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 uses `proxy.ts` (middleware renamed).
 * Refreshes the Supabase session and lightly gates /admin routes.
 * Full role checks still belong on the page/layout via the profile table.
 */
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    const hasSupabase = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    const mockMode =
      process.env.USE_MOCK_DATA === "true" || !process.env.FOOTBALL_API_KEY;

    // Mock / unconfigured auth: allow admin UI for local development.
    if (!user && !hasSupabase && mockMode) {
      return supabaseResponse;
    }

    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Soft role check via cookie (set by app after profile load).
    // If missing, allow through and let the page verify against Supabase.
    const roleCookie = request.cookies.get("gp_role")?.value;
    if (roleCookie && roleCookie !== "admin") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }

    if (!roleCookie && supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role && profile.role !== "admin") {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = "/";
        return NextResponse.redirect(homeUrl);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
