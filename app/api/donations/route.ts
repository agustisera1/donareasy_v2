import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const donorId = searchParams.get("donor_id");

  try {
    let query = supabase
      .from("donations")
      .select("*, donors(name,lastname)")
      .order("date_created", { ascending: false });

    // Si se proporciona donor_id, filtrar por ese donante
    if (donorId) {
      query = query.eq("donor_id", donorId);
    }

    const { data: donations, error: donationsError } = await query;

    if (donationsError) {
      throw donationsError;
    }

    return NextResponse.json({
      status: 200,
      data:
        donations.map(({ donors: { name, lastname }, ...donation }) => ({
          donor: `${name} ${lastname}`,
          ...donation,
        })) || [],
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      {
        error: "Error fetching donations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
