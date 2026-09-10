import { getOptionalAuth } from "@/lib/api/auth";
import { err, ok, zodErr } from "@/lib/api/response";
import { prisma } from "@/lib/db";
import { markNotificationsSchema } from "@/lib/validation/schemas";
import type { AppNotification } from "@/types/football";

function mapNotification(row: {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}): AppNotification {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET() {
  try {
    const authCtx = await getOptionalAuth();
    if (!authCtx) return ok([] as AppNotification[]);

    const rows = await prisma.notification.findMany({
      where: { userId: authCtx.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok(rows.map(mapNotification));
  } catch (error) {
    console.error("[api/notifications GET]", error);
    return ok([] as AppNotification[]);
  }
}

export async function PATCH(request: Request) {
  try {
    const authCtx = await getOptionalAuth();
    if (!authCtx) {
      return err("Authentication required", 401, { code: "UNAUTHORIZED" });
    }

    const body = await request.json().catch(() => null);
    const parsed = markNotificationsSchema.safeParse(body);
    if (!parsed.success) return zodErr(parsed.error);

    const where = {
      userId: authCtx.user.id,
      ...(parsed.data.all
        ? { read: false }
        : parsed.data.ids?.length
          ? { id: { in: parsed.data.ids } }
          : parsed.data.id
            ? { id: parsed.data.id }
            : {}),
    };

    await prisma.notification.updateMany({
      where,
      data: { read: true },
    });

    const rows = await prisma.notification.findMany({
      where: {
        userId: authCtx.user.id,
        ...(parsed.data.all
          ? {}
          : parsed.data.ids?.length
            ? { id: { in: parsed.data.ids } }
            : parsed.data.id
              ? { id: parsed.data.id }
              : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return ok(rows.map(mapNotification));
  } catch (error) {
    console.error("[api/notifications PATCH]", error);
    return err("Failed to update notifications", 500, {
      code: "NOTIFICATIONS_ERROR",
    });
  }
}
