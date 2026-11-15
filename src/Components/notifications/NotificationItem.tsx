import React from "react";

export type NotificationType = "like" | "comment" | "follow" | "mention";

export interface NotificationItemData {
  id: string;
  type: NotificationType;
  read: boolean;
  avatar: string;
  message: string;
  createdAt: string;
}

interface NotificationApiShape {
  id?: string;
  _id?: string;
  type?: NotificationType;
  read?: boolean;
  avatar?: string;
  message?: string;
  text?: string;
  createdAt?: string;
  timestamp?: string;
  user?: {
    name?: string;
    avatar?: string;
  };
  sender?: {
    name?: string;
    avatar?: string;
  };
}

interface NotificationItemProps {
  notification: NotificationApiShape;
  index?: number;
  onMarkAsRead: (notificationId: string) => void;
}

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  like: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6.13 6.13 0 0 1 15.5 4 4.5 4.5 0 0 1 20 8.5c0 3.78-3.4 6.86-8.55 11.5L12 21.35Z" />
    </svg>
  ),
  comment: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
    >
      <path d="M7 8h10M7 12h6m-8 7 2-2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2Z" />
    </svg>
  ),
  follow: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1m12-10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm7 10v-1a4 4 0 0 0-3-3.87M17 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  mention: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-4 8a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
    </svg>
  ),
};

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function getRelativeTime(value: string): string {
  if (!value) return "just now";

  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getNotificationText(notification: NotificationApiShape): string {
  const actorName =
    toString(notification.user?.name) ||
    toString(notification.sender?.name) ||
    "Someone";

  const message = toString(notification.message) || toString(notification.text);

  if (message) {
    return message;
  }

  const type: NotificationType = notification.type || "like";

  if (type === "follow") return `${actorName} started following you`;
  if (type === "comment") return `${actorName} commented on your post`;
  if (type === "mention") return `${actorName} mentioned you in a post`;

  return `${actorName} liked your post`;
}

export function normalizeNotification(
  notification: NotificationApiShape,
  index: number
): NotificationItemData {
  const createdAt =
    toString(notification.createdAt) ||
    toString(notification.timestamp) ||
    new Date().toISOString();

  const avatar =
    toString(notification.avatar) ||
    toString(notification.user?.avatar) ||
    toString(notification.sender?.avatar) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      toString(notification.user?.name) || toString(notification.sender?.name) || "User"
    )}&background=0ea5e9&color=fff`;

  return {
    id: toString(notification.id) || toString(notification._id) || `notif-${index}`,
    type: notification.type || "like",
    read: toBoolean(notification.read),
    avatar,
    message: getNotificationText(notification),
    createdAt,
  };
}

export default function NotificationItem({
  notification,
  index = 0,
  onMarkAsRead,
}: NotificationItemProps) {
  const normalized = normalizeNotification(notification, index);
  const icon = TYPE_ICON[normalized.type] || TYPE_ICON.like;

  return (
    <li role="listitem" className="list-none">
      <button
        type="button"
        aria-label={`Mark notification as read: ${normalized.message}`}
        onClick={() => onMarkAsRead(normalized.id)}
        className={[
          "group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
          normalized.read
            ? "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            : "border-sky-100 bg-sky-50 text-slate-800 dark:border-sky-900/70 dark:bg-slate-800/80 dark:text-slate-100",
        ].join(" ")}
      >
        <div className="relative mt-0.5 flex-shrink-0">
          <img
            src={normalized.avatar}
            alt=""
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
          />
          <span
            className={[
              "absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white dark:border-slate-800",
              normalized.read ? "bg-transparent" : "bg-sky-500",
            ].join(" ")}
            aria-hidden="true"
          >
            {!normalized.read && <span className="h-2 w-2 rounded-full bg-white" />}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={[
                  "inline-flex h-8 w-8 items-center justify-center rounded-full",
                  normalized.type === "like" &&
                    "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
                  normalized.type === "comment" &&
                    "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
                  normalized.type === "follow" &&
                    "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
                  normalized.type === "mention" &&
                    "bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              >
                {icon}
              </span>

              <p className="truncate text-sm font-medium leading-5">
                {normalized.message}
              </p>
            </div>

            <span className="shrink-0 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {getRelativeTime(normalized.createdAt)}
            </span>
          </div>
        </div>
      </button>
    </li>
  );
}