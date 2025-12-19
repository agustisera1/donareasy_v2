"use server";

import { createClient } from "@/lib/supabase/server";
import { DonorFormSchema } from "@/components/onboarding/donor-form";

export async function createUser() {
  // create user in supabase depending

  return { success: true };
}

export async function createDonor(formData: DonorFormSchema, userId: string) {
  const supabase = await createClient();

  try {
    // 1. Obtener el rol "donor" de la tabla roles
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "donor")
      .single();

    if (roleError || !role) {
      throw new Error(
        `Error getting role: ${roleError?.message || "Role not found"}`
      );
    }

    // 2. Insertar en user_roles
    const { data: userRole, error: userRoleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role_id: role.id,
      })
      .select("id")
      .single();

    if (userRoleError || !userRole) {
      throw new Error(
        `Error creating user role: ${userRoleError?.message || "Unknown error"}`
      );
    }

    // 3. Insertar en donors (transformar DNI de string a número)
    const { error: donorError } = await supabase.from("donors").insert({
      name: formData.name,
      lastname: formData.lastname,
      dni: parseInt(formData.dni, 10),
      address: formData.address,
      province: formData.province,
      city: formData.city,
      phone: formData.phone,
      user_id: userId,
    });

    if (donorError) {
      throw new Error(`Error creating donor: ${donorError.message}`);
    }

    // 4. Actualizar users para poner onboarding_complete = true
    const { error: updateError } = await supabase
      .from("users")
      .update({ onboarding_complete: true })
      .eq("id", userId);

    if (updateError) {
      throw new Error(`Error updating user: ${updateError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in createDonor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createInstitution() {
  // create user in supabase depending on the type of user

  return { success: true };
}
