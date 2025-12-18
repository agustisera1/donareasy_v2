import { NextResponse } from "next/server";

export async function deleteDonation() {
  // delete donation in supabase

  return NextResponse.json({ success: true });
}
