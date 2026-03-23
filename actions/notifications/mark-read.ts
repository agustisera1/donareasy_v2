"use server";

import { createClient } from "@/lib/supabase/server";

export async function markAllNotificationsRead() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return { success: false, error: "Usuario no autenticado" };
  }

  try {
    const markDirected = supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", authUser.id)
      .eq("read", false);

    const fetchBroadcasts = supabase
      .from("notifications")
      .select("id")
      .is("user_id", null);

    const fetchExistingReads = supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", authUser.id);

    const [directResult, [broadcastResult, existingReadsResult]] =
      await Promise.all([
        markDirected,
        Promise.all([fetchBroadcasts, fetchExistingReads]),
      ]);

    if (directResult.error) throw new Error(directResult.error.message);
    if (broadcastResult.error) throw new Error(broadcastResult.error.message);
    if (existingReadsResult.error)
      throw new Error(existingReadsResult.error.message);

    const allBroadcastIds = (broadcastResult.data ?? []).map((n) => n.id);
    const alreadyReadIds = new Set(
      (existingReadsResult.data ?? []).map((r) => r.notification_id)
    );
    const unreadBroadcastIds = allBroadcastIds.filter(
      (id) => !alreadyReadIds.has(id)
    );

    if (unreadBroadcastIds.length > 0) {
      const inserts = unreadBroadcastIds.map((notification_id) => ({
        notification_id,
        user_id: authUser.id,
      }));

      const { error: insertError } = await supabase
        .from("notification_reads")
        .insert(inserts);

      if (insertError) throw new Error(insertError.message);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in markAllNotificationsRead:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
