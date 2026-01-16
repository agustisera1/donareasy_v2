"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteDonation(donationId: number) {
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

    // 2. Verificar que la donación existe y pertenece al usuario autenticado
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .select("id, donor_id")
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

    // 3. Verificar que el donante pertenece al usuario autenticado
    const { data: donor, error: donorError } = await supabase
      .from("donors")
      .select("id, user_id")
      .eq("id", donation.donor_id)
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (donorError) {
      throw new Error(`Error verificando donante: ${donorError.message}`);
    }

    if (!donor) {
      return {
        success: false,
        error: "No tienes permisos para eliminar esta donación",
      };
    }

    // 4. Eliminar la donación
    const { error: deleteError } = await supabase
      .from("donations")
      .delete()
      .eq("id", donationId);

    if (deleteError) {
      throw new Error(`Error eliminando donación: ${deleteError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteDonation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
