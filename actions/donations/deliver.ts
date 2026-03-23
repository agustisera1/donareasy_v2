"use server";

import { createClient } from "@/lib/supabase/server";

export async function deliverDonation(donationId: number) {
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
        error: "Solo las instituciones pueden marcar donaciones como entregadas",
      };
    }

    // 3. Obtener la institución del usuario autenticado
    const { data: institution, error: institutionError } = await supabase
      .from("institutions")
      .select("id, user_id, name")
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

    // 4. Verificar que la donación existe, pertenece a esta institución y está aceptada
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .select("id, status, institution_id, name, donor_id")
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

    // Verificar que la donación pertenece a la institución del usuario
    if (donation.institution_id !== institution.id) {
      return {
        success: false,
        error: "No tienes permisos para marcar esta donación como entregada",
      };
    }

    // Verificar que la donación está aceptada
    if (donation.status !== "accepted") {
      return {
        success: false,
        error: "Solo se pueden marcar como entregadas las donaciones aceptadas",
      };
    }

    // 5. Preparar la fecha de entrega (fecha actual)
    const today = new Date();
    const deliveredDate = today.toISOString();

    // 6. Actualizar la donación marcándola como entregada
    const { error: updateError } = await supabase
      .from("donations")
      .update({
        status: "delivered",
        dellivered_date: deliveredDate,
      })
      .eq("id", donationId);

    if (updateError) {
      throw new Error(`Error marcando donación como entregada: ${updateError.message}`);
    }

    // Notificar al donante (no-fatal)
    try {
      const { data: donorRow } = await supabase
        .from("donors")
        .select("user_id")
        .eq("id", donation.donor_id)
        .maybeSingle();

      if (donorRow?.user_id) {
        const institutionName =
          (institution as { id: string; user_id: string; name: string }).name;
        await supabase.from("notifications").insert({
          user_id: donorRow.user_id,
          donation_id: donation.id,
          message: `Tu donación '${donation.name ?? "Donación"}' fue marcada como entregada por ${institutionName}`,
        });
      }
    } catch (notifError) {
      console.error("Error creando notificación:", notifError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deliverDonation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

