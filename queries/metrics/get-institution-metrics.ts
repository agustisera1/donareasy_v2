import "server-only";

import { authorize } from "@/lib/auth/authorize";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { createClient } from "@/lib/supabase/server";
import type { DonationMetrics } from "@/lib/types";
import { institutionMetricsSchema, type InstitutionMetricsInput } from "@/lib/validations";
import { loadDonationMetrics } from "./shared";

export async function getInstitutionMetrics(
  input: InstitutionMetricsInput,
): Promise<ServiceResult<DonationMetrics>> {
  const auth = await authorize("institutions:list");
  if (!auth.ok) return auth;

  const parsed = institutionMetricsSchema.safeParse(input);
  if (!parsed.success) return fail("NOT_FOUND", "Institución no encontrada");
  const { institutionId } = parsed.data;

  const supabase = await createClient();
  const { data: institution, error } = await supabase
    .from("institutions")
    .select("id")
    .eq("id", institutionId)
    .eq("approved", true)
    .maybeSingle();
  if (error) return unexpected("[getInstitutionMetrics] load", error);
  if (!institution) return fail("NOT_FOUND", "Institución no encontrada");

  const scope = institutionId === auth.data.entityId ? "full" : "public";
  return loadDonationMetrics(supabase, scope, institutionId);
}
