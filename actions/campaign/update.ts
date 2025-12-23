"use server";

import { createClient } from "@/lib/supabase/server";
import { type CampaignEditFormSchema } from "@/lib/validations";

export async function updateCampaign(
  formData: CampaignEditFormSchema,
  campaignId: string
) {
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
        error: "No tienes permisos para editar esta campaña",
      };
    }

    // 4. Preparar los datos para actualizar
    // Convertir termination_date de "YYYY-MM-DD" a formato timestamptz para Supabase
    // Supabase acepta formato ISO 8601, así que agregamos la hora a medianoche UTC
    const terminationDate =
      formData.termination_date && formData.termination_date.trim() !== ""
        ? `${formData.termination_date}T00:00:00.000Z`
        : null;

    // 5. Actualizar la campaña
    const { error: updateError } = await supabase
      .from("campaigns")
      .update({
        type: formData.type,
        description: formData.description,
        quantity: formData.quantity || null,
        termination_date: terminationDate,
      })
      .eq("id", campaignId);

    if (updateError) {
      throw new Error(`Error actualizando campaña: ${updateError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateCampaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
