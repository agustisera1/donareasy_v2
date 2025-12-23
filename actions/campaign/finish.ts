"use server";

import { createClient } from "@/lib/supabase/server";

export async function finishCampaign(campaignId: string) {
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

    // 2. Verificar que la campaña existe
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, institution_id")
      .eq("id", campaignId)
      .maybeSingle();

    if (campaignError) {
      throw new Error(`Error verificando campaña: ${campaignError.message}`);
    }

    if (!campaign) {
      return {
        success: false,
        error: "Campaña no encontrada",
      };
    }

    // 3. Verificar que la institución pertenece al usuario autenticado
    const { data: institution, error: institutionError } = await supabase
      .from("institutions")
      .select("id, user_id")
      .eq("id", campaign.institution_id)
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
        error: "No tienes permisos para finalizar esta campaña",
      };
    }

    // 4. Preparar la fecha de finalización (fecha actual en formato YYYY-MM-DD)
    const today = new Date();
    const terminationDate = today.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    // 5. Actualizar la campaña marcándola como finalizada y actualizando la fecha de finalización
    const { error: updateError } = await supabase
      .from("campaigns")
      .update({
        finished: true,
        termination_date: terminationDate,
      })
      .eq("id", campaignId);

    if (updateError) {
      throw new Error(`Error finalizando campaña: ${updateError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in finishCampaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
