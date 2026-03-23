"use server";

import { createClient } from "@/lib/supabase/server";

interface CreateDonationData {
  institution_id: string | null;
  donor_id: string;
  attachment_url: string;
  status: "pending";
  delivery_method: "pickup" | "shipment" | "agreement" | "transfer";
  category: "supplies" | "clothing" | "food" | "other";
  name?: string | null;
  description?: string | null;
  amount?: number | null;
  attachment_name?: string | null;
}

export async function createDonation(formData: CreateDonationData) {
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

    // 2. Verificar que el donante existe y pertenece al usuario autenticado
    const { data: donor, error: donorError } = await supabase
      .from("donors")
      .select("id, user_id")
      .eq("id", formData.donor_id)
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (donorError) {
      throw new Error(`Error verificando donante: ${donorError.message}`);
    }

    if (!donor) {
      return {
        success: false,
        error: "Donante no encontrado o no autorizado",
      };
    }

    // 3. Verificar que la institución existe (solo para donaciones dirigidas)
    if (formData.institution_id !== null) {
      const { data: institution, error: institutionError } = await supabase
        .from("institutions")
        .select("id")
        .eq("id", formData.institution_id)
        .maybeSingle();

      if (institutionError) {
        throw new Error(
          `Error verificando institución: ${institutionError.message}`,
        );
      }

      if (!institution) {
        return {
          success: false,
          error: "Institución no encontrada",
        };
      }
    }

    // 4. Insertar la donación
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        institution_id: formData.institution_id,
        donor_id: formData.donor_id,
        attachment_url: formData.attachment_url,
        status: formData.status,
        delivery_method: formData.delivery_method,
        category: formData.category,
        name: formData.name || null,
        description: formData.description || null,
        amount: formData.amount || null,
        attachment_name: formData.attachment_name || null,
      })
      .select("id")
      .single();

    if (donationError) {
      throw new Error(`Error creando donación: ${donationError.message}`);
    }

    if (!donation) {
      throw new Error("Error: No se pudo crear la donación");
    }

    // Crear notificación (no-fatal)
    try {
      const donationName = formData.name ?? "Donación";
      if (formData.institution_id !== null) {
        const { data: targetInstitution } = await supabase
          .from("institutions")
          .select("user_id")
          .eq("id", formData.institution_id)
          .maybeSingle();

        if (targetInstitution?.user_id) {
          await supabase.from("notifications").insert({
            user_id: targetInstitution.user_id,
            donation_id: donation.id,
            message: `Nueva donación disponible: ${donationName}`,
          });
        }
      } else {
        await supabase.from("notifications").insert({
          user_id: null,
          donation_id: donation.id,
          message: `Nueva donación disponible: ${donationName}`,
        });
      }
    } catch (notifError) {
      console.error("Error creando notificación:", notifError);
    }

    return { success: true, data: donation };
  } catch (error) {
    console.error("Error in createDonation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
