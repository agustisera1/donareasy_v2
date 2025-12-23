"use server";

import { createClient } from "@/lib/supabase/server";
import { type CampaignFormSchema } from "@/lib/validations";

export async function createCampaign(
  formData: CampaignFormSchema,
  institutionId: string
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

    // 2. Verificar que la institución existe y pertenece al usuario
    const { data: institution, error: institutionError } = await supabase
      .from("institutions")
      .select("id, user_id")
      .eq("id", institutionId)
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
        error: "Institución no encontrada o no autorizada",
      };
    }

    // 3. Insertar la campaña
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        type: formData.type,
        description: formData.description,
        quantity: formData.quantity || null,
        termination_date: formData.termination_date || null,
        institution_id: institutionId,
      })
      .select("id")
      .single();

    if (campaignError) {
      throw new Error(`Error creando campaña: ${campaignError.message}`);
    }

    if (!campaign) {
      throw new Error("Error: No se pudo crear la campaña");
    }

    return { success: true, data: campaign };
  } catch (error) {
    console.error("Error in createCampaign:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
