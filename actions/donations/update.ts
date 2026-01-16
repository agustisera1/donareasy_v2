"use server";

import { createClient } from "@/lib/supabase/server";

interface UpdateDonationData {
  name?: string | null;
  description?: string | null;
  amount?: number | null;
  attachment_name?: string | null;
  attachment_url?: string;
  delivery_method?: "pickup" | "shipment" | "agreement";
  category?: "supplies" | "clothing" | "food" | "other";
}

export async function updateDonation(
  donationId: number,
  formData: UpdateDonationData
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
        error: "No tienes permisos para editar esta donación",
      };
    }

    // 4. Actualizar la donación
    const updateData: Partial<UpdateDonationData> = {};
    if (formData.name !== undefined) updateData.name = formData.name;
    if (formData.description !== undefined)
      updateData.description = formData.description;
    if (formData.amount !== undefined) updateData.amount = formData.amount;
    if (formData.attachment_name !== undefined)
      updateData.attachment_name = formData.attachment_name;
    if (formData.attachment_url !== undefined)
      updateData.attachment_url = formData.attachment_url;
    if (formData.delivery_method !== undefined)
      updateData.delivery_method = formData.delivery_method;
    if (formData.category !== undefined)
      updateData.category = formData.category;

    const { error: updateError } = await supabase
      .from("donations")
      .update(updateData)
      .eq("id", donationId);

    if (updateError) {
      throw new Error(`Error actualizando donación: ${updateError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateDonation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
