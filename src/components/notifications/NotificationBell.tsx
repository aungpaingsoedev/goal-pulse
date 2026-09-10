"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  NotificationItem,
  type NotificationItemData,
} from "@/components/notifications/NotificationItem";
import { cn } from "@/lib/utils";

export interface NotificationBellProps {
  notifications?: NotificationItemData[];
  onItemClick?: (notification: NotificationItemData) => void;
  onMarkAllRead?: () => void;
  className?: string;
}

export function NotificationBell({
  notifications = [],
  onItemClick,
  onMarkAllRead,
  className,
}: NotificationBellProps) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className={cn("relative", className)}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-live px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && onMarkAllRead ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs text-live hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <div className="max-h-80 overflow-y-auto p-1">
          {notifications.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={() => onItemClick?.(n)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
