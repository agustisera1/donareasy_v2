"use server";

import { createClient } from "@/lib/supabase/server";

export async function acceptDonation(donationId: number) {
  const supabase = await createClient();

  try {
    // 1. Verificar que el usuario esté autenticado
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    // 2. Verificar que el usuario es una institución
    const { data: userRole, error: userRoleError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (userRoleError) {
      throw new Error(`Error verificando rol: ${userRoleError.message}`);
    }

    if (!userRole) {
      return {
        success: false,
        error: "Usuario sin rol asignado",
      };
    }

    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("name")
      .eq("id", userRole.role_id)
      .maybeSingle();

    if (roleError) {
      throw new Error(`Error obteniendo rol: ${roleError.message}`);
    }

    if (role?.name !== "institution") {
      return {
        success: false,
        error: "Solo las instituciones pueden aceptar donaciones",
      };
    }

    // 3. Obtener la institución del usuario autenticado
    const { data: institution, error: institutionError } = await supabase
      .from("institutions")
      .select("id, user_id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (institutionError) {
      throw new Error(
        `Error verificando institución: ${institutionError.message}`
      );
    }

    if (!institution) {
      return {
        success: false,
        error: "Institución no encontrada",
      };
    }

    // 4. Verificar que la donación existe y pertenece a esta institución
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .select("id, status, institution_id")
      .eq("id", donationId)
      .maybeSingle();

    if (donationError) {
      throw new Error(`Error verificando donación: ${donationError.message}`);
    }

    if (!donation) {
      return {
        success: false,
        error: "Donación no encontrada",
      };
    }

    // Verificar permisos: donaciones abiertas pueden ser aceptadas por cualquier institución;
    // donaciones dirigidas solo por la institución destino
    if (donation.institution_id !== null && donation.institution_id !== institution.id) {
      return {
        success: false,
        error: "No tienes permisos para aceptar esta donación",
      };
    }

    if (donation.status !== "pending") {
      return {
        success: false,
        error: "Solo se pueden aceptar donaciones pendientes",
      };
    }

    // 5. Preparar la fecha de aceptación (fecha actual)
    const today = new Date();
    const acceptedDate = today.toISOString();

    // 6. Actualizar la donación marcándola como aceptada.
    // Para donaciones abiertas, también se asigna la institución que acepta.
    const updateData: {
      status: string;
      date_accepted: string;
      institution_id?: string;
    } = {
      status: "accepted",
      date_accepted: acceptedDate,
    };

    if (donation.institution_id === null) {
      updateData.institution_id = institution.id;
    }

    const { error: updateError } = await supabase
      .from("donations")
      .update(updateData)
      .eq("id", donationId);

    if (updateError) {
      throw new Error(`Error aceptando donación: ${updateError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in acceptDonation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

