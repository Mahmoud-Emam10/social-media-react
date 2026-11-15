import React, { useCallback, useEffect, useMemo, useState } from "react";
import NotificationList from "../../Components/notifications/NotificationList";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../../services/notification.service";
import { normalizeNotification, type NotificationItemData } from "../../Components/notifications/NotificationItem";

type NotificationFilter = "all" | "unread";

interface NotificationApiResponse {
  notifications?: unknown[];
  items?: unknown[];
  data?: unknown[];
  [key: string]: unknown;
}

function toNotificationList(payload: unknown): NotificationItemData[] {
  if (Array.isArray(payload)) {
    return payload.map((item, index) => normalizeNotification(item as Record<string, unknown>, index));
  }

  if (payload && typeof payload === "object") {
    const response = payload as NotificationApiResponse;

    const rawList =
      Array.isArray(response.notifications)
        ? response.notifications
        : Array.isArray(response.items)
          ? response.items
          : Array.isArray(response.data)
            ? response.data
            : [];

    return rawList.map((item, index) => normalizeNotification(item as Record<string, unknown>, index));
  }

  return [];
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<boolean>(false);

  const fetchNotifications = useCallback(
    async (nextFilter: NotificationFilter = filter) => {
      setLoading(true);
      setError("");

      try {
        const response = await getNotifications({
          unread: nextFilter === "unread",
          page: 1,
          limit: 10,
        });

        setNotifications(toNotificationList(response));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load notifications.";

        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    fetchNotifications(filter);
  }, [fetchNotifications, filter]);

  const displayedNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => !item.read);
    }
    return notifications;
  }, [filter, notifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const optimisticMarkAsRead = async (notificationId: string) => {
    const previousNotifications = notifications;

    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item
      )
    );

    setPendingAction(true);

    try {
      await markAsRead(notificationId);
    } catch (err) {
      setNotifications(previousNotifications);
      const message =
        err instanceof Error ? err.message : "Could not mark this notification as read.";

      setError(message);
    } finally {
      setPendingAction(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!notifications.some((item) => !item.read)) return;

    const previousNotifications = notifications;

    setNotifications((current) =>
      current.map((item) => (item.read ? item : { ...item, read: true }))
    );

    setPendingAction(true);

    try {
      await markAllAsRead();
    } catch (err) {
      setNotifications(previousNotifications);
      const message =
        err instanceof Error ? err.message : "Could not mark all notifications as read.";

      setError(message);
    } finally {
      setPendingAction(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
                Activity
              </p>
              <h1 className="mt-1 text-2xl font-bold">Notifications</h1>
            </div>

            <button
              type="button"
              aria-label="Mark all notifications as read"
              onClick={handleMarkAllAsRead}
              disabled={pendingAction || unreadCount === 0}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              Mark all as read
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Notification filters"
            className="mt-4 flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
          >
            {[
              { key: "all", label: "All" },
              { key: "unread", label: "Unread" },
            ].map((tab) => {
              const isActive = filter === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Filter notifications: ${tab.label}`}
                  onClick={() => setFilter(tab.key as NotificationFilter)}
                  className={[
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
                  ].join(" ")}
                >
                  {tab.label}
                  {tab.key === "unread" && unreadCount > 0 && (
                    <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-500 px-1.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        <section
          aria-live="polite"
          className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 sm:p-4"
        >
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
              Loading notifications...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              <p className="font-medium">Unable to load notifications.</p>
              <p className="mt-1">{error}</p>

              <button
                type="button"
                aria-label="Retry loading notifications"
                onClick={() => fetchNotifications(filter)}
                className="mt-3 inline-flex rounded-lg bg-red-600 px-3 py-2 font-medium text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && !displayedNotifications.length && (
            <div className="py-10 text-center">
              <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                You’re all caught up.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                No notifications to show right now.
              </p>
            </div>
          )}

          {!loading && !error && displayedNotifications.length > 0 && (
            <NotificationList
              notifications={displayedNotifications}
              onMarkAsRead={optimisticMarkAsRead}
            />
          )}
        </section>
      </div>
    </main>
  );
}