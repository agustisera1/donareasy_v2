import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NotificationWithReadStatus } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: userRoleRow } = await supabase
      .from("user_roles")
      .select("role_id, roles(name)")
      .eq("user_id", authUser.id)
      .maybeSingle();

    const role = (userRoleRow?.roles as { name: string } | null)?.name;

    const { data: directed, error: directedError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });

    if (directedError) throw directedError;

    const directedWithStatus: NotificationWithReadStatus[] = (
      directed ?? []
    ).map((n) => ({ ...n, is_read: n.read }));

    if (role !== "institution") {
      return NextResponse.json({ data: directedWithStatus });
    }

    const { data: broadcasts, error: broadcastError } = await supabase
      .from("notifications")
      .select("*, notification_reads!left(user_id)")
      .is("user_id", null)
      .order("created_at", { ascending: false });

    if (broadcastError) throw broadcastError;

    const broadcastWithStatus: NotificationWithReadStatus[] = (
      broadcasts ?? []
    ).map((n) => {
      const reads = n.notification_reads as { user_id: string }[] | null;
      const is_read = reads?.some((r) => r.user_id === authUser.id) ?? false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { notification_reads: _, ...rest } = n;
      return { ...rest, is_read };
    });

    const all = [...directedWithStatus, ...broadcastWithStatus].sort((a, b) => {
      if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return NextResponse.json({ data: all });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Error fetching notifications" },
      { status: 500 }
    );
  }
}
