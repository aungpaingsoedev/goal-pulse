"use client";

import { Bell } from "lucide-react";
import { EmptyState } from "@/components/football/EmptyState";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkNotificationsRead,
  useNotifications,
} from "@/hooks/use-notifications";
import type { NotificationType } from "@/types/football";

function mapType(
  type: string,
): "goal" | "card" | "kickoff" | "final" | "lineup" | "system" | undefined {
  const allowed = ["goal", "card", "kickoff", "final", "lineup", "system"];
  return allowed.includes(type)
    ? (type as "goal" | "card" | "kickoff" | "final" | "lineup" | "system")
    : undefined;
}

export default function NotificationsPage() {
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationsRead();
  const notifications = notificationsQuery.data ?? [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description={
          unread ? `${unread} unread` : "You’re caught up on alerts."
        }
        actions={
          unread > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={markRead.isPending}
              onClick={() => markRead.mutate({ all: true })}
            >
              Mark all read
            </Button>
          ) : null
        }
      />

      {notificationsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      ) : notificationsQuery.isError ? (
        <EmptyState
          title="Couldn’t load notifications"
          actionLabel="Retry"
          onAction={() => void notificationsQuery.refetch()}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="Goal and kickoff alerts for your favorites will show up here."
        />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={{
                id: n.id,
                title: n.title,
                body: n.message,
                createdAt: n.createdAt,
                read: n.read,
                type: mapType(n.type as NotificationType | string),
              }}
              onClick={() => {
                if (!n.read) markRead.mutate({ id: n.id });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
