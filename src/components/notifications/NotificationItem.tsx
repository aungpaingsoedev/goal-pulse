import { cn } from "@/lib/utils";

export interface NotificationItemData {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  read?: boolean;
  type?: "goal" | "card" | "kickoff" | "final" | "lineup" | "system";
}

export interface NotificationItemProps {
  notification: NotificationItemData;
  onClick?: () => void;
  className?: string;
}

function typeGlyph(type?: NotificationItemData["type"]) {
  switch (type) {
    case "goal":
      return "⚽";
    case "card":
      return "🟨";
    case "kickoff":
      return "▶️";
    case "final":
      return "🏁";
    case "lineup":
      return "📋";
    default:
      return "•";
  }
}

function relativeTime(iso: string) {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function NotificationItem({
  notification,
  onClick,
  className,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-secondary/80",
        !notification.read && "bg-primary/5",
        className,
      )}
    >
      <span className="mt-0.5 w-5 shrink-0 text-center text-sm">
        {typeGlyph(notification.type)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-snug">
            {notification.title}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {relativeTime(notification.createdAt)}
          </span>
        </span>
        {notification.body ? (
          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
            {notification.body}
          </span>
        ) : null}
      </span>
      {!notification.read ? (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-live" />
      ) : null}
    </button>
  );
}
