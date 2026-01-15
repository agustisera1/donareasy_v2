import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type InstitutionData = {
  role: "institution";
  email: string;
  created_at: string;
  id: string;
  name: string;
  director: string;
  address: string;
  province: string;
  city: string;
  phone: string;
  foundation_date: string;
  bank: string | null;
  lore: string | null;
  user_id: string;
};

export type DonorData = {
  role: "donor";
  email: string;
  created_at: string;
  id: string;
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
    // 1. Obtener el usuario autenticado
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Obtener los datos del usuario de la tabla users
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (usersError) throw usersError;
    if (!usersData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = usersData.id;

    // 3. Obtener el rol del usuario
    const { data: userRolesData, error: userRolesError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (userRolesError) throw userRolesError;
    if (!userRolesData) {
      // Usuario sin rol asignado (aún no completó el onboarding)
      return NextResponse.json({
        status: 200,
        data: {
          role: null,
          email: usersData.email,
          created_at: usersData.created_at,
          onboarding_complete: usersData.onboarding_complete,
        },
      });
    }

    const roleId = userRolesData.role_id;

    // 4. Obtener el nombre del rol
    const { data: rolesData, error: rolesError } = await supabase
      .from("roles")
      .select("name")
      .eq("id", roleId)
      .maybeSingle();

    if (rolesError) throw rolesError;
    if (!rolesData) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const role = rolesData.name;

    // 5. Obtener los datos específicos según el rol
    let roleBasedData = {};

    if (role === "donor") {
      const { data: donorData, error: donorError } = await supabase
        .from("donors")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (donorError) throw donorError;
      if (!donorData) {
        return NextResponse.json(
          { error: "Donor data not found" },
          { status: 404 }
        );
      }

      roleBasedData = {
        ...donorData,
      };
    } else if (role === "institution") {
      const { data: institutionData, error: institutionError } = await supabase
        .from("institutions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (institutionError) throw institutionError;
      if (!institutionData) {
        return NextResponse.json(
          { error: "Institution data not found" },
          { status: 404 }
        );
      }

      roleBasedData = {
        ...institutionData,
      };
    }

    return NextResponse.json({
      status: 200,
      data: {
        role: role,
        email: usersData.email,
        created_at: usersData.created_at,
        ...roleBasedData,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        error: "Error fetching users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
