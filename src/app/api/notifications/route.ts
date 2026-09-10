import { getOptionalAuth } from "@/lib/api/auth";
import { err, ok, zodErr } from "@/lib/api/response";
import { markNotificationsSchema } from "@/lib/validation/schemas";
import type { AppNotification } from "@/types/football";

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
};

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function GET() {
  try {
    const auth = await getOptionalAuth();
    if (!auth) return ok([] as AppNotification[]);

    const { data, error } = await auth.supabase
      .from("notifications")
      .select("id, user_id, title, message, type, read, created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.warn("[api/notifications GET] fallback:", error.message);
      return ok([] as AppNotification[]);
    }

    return ok(((data ?? []) as NotificationRow[]).map(mapNotification));
  } catch (error) {
    console.error("[api/notifications GET]", error);
    return ok([] as AppNotification[]);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getOptionalAuth();
    if (!auth) {
      return err("Authentication required", 401, { code: "UNAUTHORIZED" });
    }

    const body = await request.json().catch(() => null);
    const parsed = markNotificationsSchema.safeParse(body);
    if (!parsed.success) return zodErr(parsed.error);

    let query = auth.supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", auth.user.id);

    if (parsed.data.all) {
      query = query.eq("read", false);
    } else if (parsed.data.ids?.length) {
      query = query.in("id", parsed.data.ids);
    } else if (parsed.data.id) {
      query = query.eq("id", parsed.data.id);
    }

    const { data, error } = await query
      .select("id, user_id, title, message, type, read, created_at");

    if (error) {
      console.warn("[api/notifications PATCH]", error.message);
      return err("Failed to update notifications", 503, {
        code: "NOTIFICATIONS_UNAVAILABLE",
        details: error.message,
      });
    }

    return ok(((data ?? []) as NotificationRow[]).map(mapNotification));
  } catch (error) {
    console.error("[api/notifications PATCH]", error);
    return err("Failed to update notifications", 500, {
      code: "NOTIFICATIONS_ERROR",
    });
  }
}
