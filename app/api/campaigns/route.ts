import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get("institution_id");

  try {
    let query = supabase
      .from("campaigns")
      .select("*")
      .order("start_date", { ascending: false });

    // Si se proporciona institution_id, filtrar por esa institución
    if (institutionId) {
      query = query.eq("institution_id", institutionId);
    }

    const { data: campaigns, error: campaignsError } = await query;

    if (campaignsError) {
      throw campaignsError;
    }

    return NextResponse.json({
      status: 200,
      data: campaigns || [],
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      {
        error: "Error fetching campaigns",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
