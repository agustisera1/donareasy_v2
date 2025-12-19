import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type InstitutionData = unknown;
export type DonnorData = {
  role: "donnor";
  email: string;
  username: string;
  created_at: string;
  name: string;
  lastname: string;
  dni: number;
  address: string;
  province: string;
  city: string;
  phone: string;
  user_id: string;
};

export async function GET() {
  const supabase = await createClient();
  try {
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("email", "agustisera1@gmail.com")
      .single();

    if (usersError) throw usersError;
    const userId = usersData?.id;
    if (!userId) throw new Error("User not found");

    const { data: userRolesData, error: userRolesError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (userRolesError) throw userRolesError;
    const roleId = userRolesData?.role_id;
    if (!roleId) throw new Error("User role not found");

    const { data: rolesData, error: rolesError } = await supabase
      .from("roles")
      .select("*")
      .eq("id", roleId)
      .single();

    if (rolesError) throw rolesError;
    const role = rolesData?.name;
    if (!role) throw new Error("Role not found");

    let roleBasedData = {};
    if (role === "donnor") {
      const { data: donnorData, error: donnorError } = await supabase
        .from("donnors")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (donnorError) throw donnorError;
      roleBasedData = {
        ...donnorData,
      };
    }

    if (role === "institution") {
      throw new Error("Institution role not found");
    }

    return NextResponse.json({
      status: 200,
      data: {
        role: role,
        email: usersData?.email,
        username: usersData?.username,
        ...roleBasedData,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}
