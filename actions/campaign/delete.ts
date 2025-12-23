import { NextResponse } from "next/server";

export async function deleteCampaign() {
  // delete campaign in supabase

  return NextResponse.json({ success: true });
}
