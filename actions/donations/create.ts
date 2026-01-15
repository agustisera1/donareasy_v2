"use server";

import { createClient } from "@/lib/supabase/server";

interface CreateDonationData {
  institution_id: string;
  donnor_id: string;
  attachment_url: string;
  status: "pending";
  type?: string | null;
  amount?: number | null;
  transfer_receipt?: string | null;
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
      .eq("id", formData.donnor_id)
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

    // 3. Verificar que la institución existe
    const { data: institution, error: institutionError } = await supabase
      .from("institutions")
      .select("id")
      .eq("id", formData.institution_id)
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

    // 4. Insertar la donación
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        institution_id: formData.institution_id,
        donnor_id: formData.donnor_id,
        attachment_url: formData.attachment_url,
        status: formData.status,
        type: formData.type || null,
        amount: formData.amount || null,
        transfer_receipt: formData.transfer_receipt || null,
      })
      .select("id")
      .single();

    if (donationError) {
      throw new Error(`Error creando donación: ${donationError.message}`);
    }

    if (!donation) {
      throw new Error("Error: No se pudo crear la donación");
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
