"use client";

import { Bell } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { useNotifications } from "@/hooks/use-notifications";
import { markAllNotificationsRead } from "@/actions/notifications/mark-read";
import { formatDate } from "@/lib/utils";
import type { NotificationWithReadStatus } from "@/lib/types";

export function NotificationBell() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.user_id ?? null;
  const role = user?.role ?? null;

  const { notifications, unreadCount } = useNotifications({ userId, role });

  const handleOpenChange = async (open: boolean) => {
    if (open && unreadCount > 0) {
      await markAllNotificationsRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  };

  if (!userId || !role) return null;

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button className="relative p-1 rounded-md hover:bg-accent transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notificaciones</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} sin leer
            </Badge>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No hay notificaciones
            </p>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
}: {
  notification: NotificationWithReadStatus;
}) {
  return (
    <div
      className={`flex flex-col gap-1 border-b px-4 py-3 last:border-b-0 ${
        !notification.is_read ? "bg-accent/40" : ""
      }`}
    >
      <p className="text-sm leading-snug">{notification.message}</p>
      <p className="text-xs text-muted-foreground">
        {formatDate(notification.created_at)}
      </p>
    </div>
  );
}
