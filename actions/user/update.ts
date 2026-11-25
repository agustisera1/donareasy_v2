"use server";

import { authorize } from "@/lib/auth/authorize";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import {
  donorEditSchema,
  institutionEditSchema,
  type DonorEditFormSchema,
  type InstitutionEditFormSchema,
} from "@/lib/validations";

export async function updateDonor(input: DonorEditFormSchema): Promise<ServiceResult<null>> {
  const auth = await authorize("profile:donor");
  if (!auth.ok) return auth;

  const parsed = donorEditSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const supabase = await createClient();
  const { error } = await supabase
    .from("donors")
    .update({ ...parsed.data, dni: parseInt(parsed.data.dni, 10) })
    .eq("id", auth.data.entityId);
  if (error) return unexpected("[updateDonor]", error);

  revalidatePaths([{ path: "/dashboard", type: "layout" }]);
  return { ok: true, data: null };
}

export async function updateInstitution(input: InstitutionEditFormSchema): Promise<ServiceResult<null>> {
  const auth = await authorize("profile:institution");
  if (!auth.ok) return auth;

  const parsed = institutionEditSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const supabase = await createClient();
  const { error } = await supabase
    .from("institutions")
    .update({ ...parsed.data, lore: parsed.data.lore || null })
    .eq("id", auth.data.entityId);
  if (error) return unexpected("[updateInstitution]", error);

  revalidatePaths([{ path: "/dashboard", type: "layout" }]);
  return { ok: true, data: null };
}
