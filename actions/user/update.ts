"use server";

import { createClient } from "@/lib/supabase/server";

// Tipo para actualizar datos de donor
export type DonorUpdateData = {
  name: string;
  lastname: string;
  dni: string; // Se convierte a number antes de actualizar
  phone: string;
  address: string;
  province: string;
  city: string;
};

// Tipo para actualizar datos de institution
export type InstitutionUpdateData = {
  director: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  bank: string;
  lore?: string; // Opcional
};

export async function updateDonor(formData: DonorUpdateData, userId: string) {
  const supabase = await createClient();

  try {
    // Actualizar la tabla donors usando user_id
    const { error: donorError } = await supabase
      .from("donors")
      .update({
        name: formData.name,
        lastname: formData.lastname,
        dni: parseInt(formData.dni, 10),
        address: formData.address,
        province: formData.province,
        city: formData.city,
        phone: formData.phone,
      })
      .eq("user_id", userId);

    if (donorError) {
      throw new Error(`Error updating donor: ${donorError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateDonor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateInstitution(
  formData: InstitutionUpdateData,
  userId: string
) {
  const supabase = await createClient();

  try {
    // Actualizar la tabla institutions usando user_id
    const { error: institutionError } = await supabase
      .from("institutions")
      .update({
        director: formData.director,
        address: formData.address,
        province: formData.province,
        city: formData.city,
        phone: formData.phone,
        bank: formData.bank,
        lore: formData.lore || null,
      })
      .eq("user_id", userId);

    if (institutionError) {
      throw new Error(
        `Error updating institution: ${institutionError.message}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateInstitution:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
