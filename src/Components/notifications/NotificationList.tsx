import React from "react";
import NotificationItem, { type NotificationItemData } from "./NotificationItem";

interface NotificationListProps {
  notifications: NotificationItemData[];
  onMarkAsRead: (notificationId: string) => void;
}

export default function NotificationList({
  notifications,
  onMarkAsRead,
}: NotificationListProps) {
  if (!notifications.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        No notifications yet.
      </div>
    );
  }

  return (
    <ul role="list" aria-label="Notifications list" className="space-y-3">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          index={index}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </ul>
  );
}