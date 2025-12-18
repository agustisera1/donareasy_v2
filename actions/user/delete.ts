import { NextResponse } from "next/server";

export async function deleteUser() {
  // delete user in supabase

  return NextResponse.json({ success: true });
}
