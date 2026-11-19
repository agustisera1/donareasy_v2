"use server";

import { createClient } from "@/lib/supabase/server";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import {
  donorSchema,
  institutionSchema,
  type DonorFormSchema,
  type InstitutionFormSchema,
} from "@/lib/validations";

const UNIQUE_VIOLATION = "23505";

type RpcError = { code: string } | null;

function toResult(tag: string, error: RpcError): ServiceResult<null> {
  if (!error) return { ok: true, data: null };
  if (error.code === UNIQUE_VIOLATION)
    return fail("CONFLICT", "Tu cuenta ya tiene un perfil asignado");
  return unexpected(tag, error);
}

// Sin authorize: el usuario todavía no tiene rol, solo se exige sesión.
export async function completeDonorOnboarding(
  input: DonorFormSchema
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("UNAUTHORIZED", "Iniciá sesión para continuar");

  const parsed = donorSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);
  const donor = parsed.data;

  const { error } = await supabase.rpc("complete_donor_onboarding", {
    p_name: donor.name,
    p_lastname: donor.lastname,
    p_dni: parseInt(donor.dni, 10),
    p_address: donor.address,
    p_province: donor.province,
    p_city: donor.city,
    p_phone: donor.phone,
  });
  return toResult("[completeDonorOnboarding]", error);
}

export async function completeInstitutionOnboarding(
  input: InstitutionFormSchema
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("UNAUTHORIZED", "Iniciá sesión para continuar");

  const parsed = institutionSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);
  const institution = parsed.data;

  const { error } = await supabase.rpc("complete_institution_onboarding", {
    p_name: institution.name,
    p_director: institution.director,
    p_address: institution.address,
    p_province: institution.province,
    p_city: institution.city,
    p_phone: institution.phone,
    p_foundation_date: institution.foundation_date,
    p_bank: institution.bank,
    p_lore: institution.lore || null,
  });
  return toResult("[completeInstitutionOnboarding]", error);
}
