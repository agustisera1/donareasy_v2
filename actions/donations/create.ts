import { NextResponse } from "next/server";

export async function createDonation() {
  // create donation in supabase depending on the type of donation

  return NextResponse.json({ success: true });
}
