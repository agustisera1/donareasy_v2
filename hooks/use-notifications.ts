"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { NotificationWithReadStatus } from "@/lib/types";

interface UseNotificationsOptions {
  userId: string | null;
  role: string | null;
}

export function useNotifications({ userId, role }: UseNotificationsOptions) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Error fetching notifications");
      const { data } = await res.json();
      return (data ?? []) as NotificationWithReadStatus[];
    },
    enabled: !!userId && !!role,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!userId || !role) return;

    const supabase = createClient();
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    const directedChannel = supabase
      .channel(`notifications:directed:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        invalidate
      )
      .subscribe();

    let broadcastChannel: ReturnType<typeof supabase.channel> | null = null;
    if (role === "institution") {
      broadcastChannel = supabase
        .channel("notifications:broadcast")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: "user_id=is.null",
          },
          invalidate
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(directedChannel);
      if (broadcastChannel) supabase.removeChannel(broadcastChannel);
    };
  }, [userId, role, queryClient]);

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
