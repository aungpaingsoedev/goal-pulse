import { getOptionalAuth } from "@/lib/api/auth";
import { err, ok, zodErr } from "@/lib/api/response";
import {
  favoriteSchema,
  removeFavoriteSchema,
} from "@/lib/validation/schemas";
import type { Favorite, FavoriteType } from "@/types/football";
import type { SupabaseClient } from "@supabase/supabase-js";

type FavoriteRow = {
  id: string;
  user_id: string;
  type: FavoriteType;
  entity_id: number;
  created_at: string;
};

function mapFavorite(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    entityId: row.entity_id,
    createdAt: row.created_at,
  };
}

async function listFavorites(
  supabase: SupabaseClient,
  userId: string,
): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id, user_id, type, entity_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[api/favorites] list fallback:", error.message);
    return [];
  }

  return ((data ?? []) as FavoriteRow[]).map(mapFavorite);
}

export async function GET() {
  try {
    const auth = await getOptionalAuth();
    if (!auth) return ok([] as Favorite[]);

    const favorites = await listFavorites(auth.supabase, auth.user.id);
    return ok(favorites);
  } catch (error) {
    console.error("[api/favorites GET]", error);
    return ok([] as Favorite[]);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getOptionalAuth();
    if (!auth) {
      return err("Authentication required", 401, { code: "UNAUTHORIZED" });
    }

    const body = await request.json().catch(() => null);
    const parsed = favoriteSchema.safeParse(body);
    if (!parsed.success) return zodErr(parsed.error);

    const { data, error } = await auth.supabase
      .from("favorites")
      .upsert(
        {
          user_id: auth.user.id,
          type: parsed.data.type,
          entity_id: parsed.data.entityId,
        },
        { onConflict: "user_id,type,entity_id" },
      )
      .select("id, user_id, type, entity_id, created_at")
      .maybeSingle();

    if (error) {
      console.warn("[api/favorites POST]", error.message);
      return err("Failed to save favorite", 503, {
        code: "FAVORITES_UNAVAILABLE",
        details: error.message,
      });
    }

    if (!data) {
      return err("Failed to save favorite", 500, { code: "FAVORITES_ERROR" });
    }

    return ok(mapFavorite(data as FavoriteRow));
  } catch (error) {
    console.error("[api/favorites POST]", error);
    return err("Failed to save favorite", 500, { code: "FAVORITES_ERROR" });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getOptionalAuth();
    if (!auth) {
      return err("Authentication required", 401, { code: "UNAUTHORIZED" });
    }

    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));

    const parsed = removeFavoriteSchema.safeParse({
      id: body?.id ?? searchParams.get("id") ?? undefined,
      type: body?.type ?? searchParams.get("type") ?? undefined,
      entityId:
        body?.entityId ??
        (searchParams.get("entityId")
          ? Number(searchParams.get("entityId"))
          : undefined),
    });

    if (!parsed.success) return zodErr(parsed.error);

    let query = auth.supabase.from("favorites").delete().eq("user_id", auth.user.id);

    if (parsed.data.id) {
      query = query.eq("id", parsed.data.id);
    } else if (parsed.data.type && parsed.data.entityId) {
      query = query
        .eq("type", parsed.data.type)
        .eq("entity_id", parsed.data.entityId);
    }

    const { error } = await query;
    if (error) {
      console.warn("[api/favorites DELETE]", error.message);
      return err("Failed to remove favorite", 503, {
        code: "FAVORITES_UNAVAILABLE",
        details: error.message,
      });
    }

    return ok({ removed: true });
  } catch (error) {
    console.error("[api/favorites DELETE]", error);
    return err("Failed to remove favorite", 500, { code: "FAVORITES_ERROR" });
  }
}
