import { getOptionalAuth } from "@/lib/api/auth";
import { err, ok, zodErr } from "@/lib/api/response";
import { prisma } from "@/lib/db";
import {
  favoriteSchema,
  removeFavoriteSchema,
} from "@/lib/validation/schemas";
import type { Favorite, FavoriteType } from "@/types/football";

function mapFavorite(row: {
  id: string;
  userId: string;
  type: string;
  entityId: number;
  createdAt: Date;
}): Favorite {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as FavoriteType,
    entityId: row.entityId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    const authCtx = await getOptionalAuth();
    if (!authCtx) return ok([] as Favorite[]);

    const favorites = await prisma.favorite.findMany({
      where: { userId: authCtx.user.id },
      orderBy: { createdAt: "desc" },
    });

    return ok(favorites.map(mapFavorite));
  } catch (error) {
    console.error("[api/favorites GET]", error);
    return ok([] as Favorite[]);
  }
}

export async function POST(request: Request) {
  try {
    const authCtx = await getOptionalAuth();
    if (!authCtx) {
      return err("Authentication required", 401, { code: "UNAUTHORIZED" });
    }

    const body = await request.json().catch(() => null);
    const parsed = favoriteSchema.safeParse(body);
    if (!parsed.success) return zodErr(parsed.error);

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_type_entityId: {
          userId: authCtx.user.id,
          type: parsed.data.type,
          entityId: parsed.data.entityId,
        },
      },
      create: {
        userId: authCtx.user.id,
        type: parsed.data.type,
        entityId: parsed.data.entityId,
      },
      update: {},
    });

    return ok(mapFavorite(favorite));
  } catch (error) {
    console.error("[api/favorites POST]", error);
    return err("Failed to save favorite", 500, { code: "FAVORITES_ERROR" });
  }
}

export async function DELETE(request: Request) {
  try {
    const authCtx = await getOptionalAuth();
    if (!authCtx) {
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

    if (parsed.data.id) {
      await prisma.favorite.deleteMany({
        where: { id: parsed.data.id, userId: authCtx.user.id },
      });
    } else if (parsed.data.type && parsed.data.entityId) {
      await prisma.favorite.deleteMany({
        where: {
          userId: authCtx.user.id,
          type: parsed.data.type,
          entityId: parsed.data.entityId,
        },
      });
    }

    return ok({ removed: true });
  } catch (error) {
    console.error("[api/favorites DELETE]", error);
    return err("Failed to remove favorite", 500, { code: "FAVORITES_ERROR" });
  }
}
