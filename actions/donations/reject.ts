"use server";

import { authorize } from "@/lib/auth/authorize";
import { canReject } from "@/lib/policies/donation";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { rejectDonationSchema, type RejectDonationInput } from "@/lib/validations";

export async function rejectDonation(input: RejectDonationInput): Promise<ServiceResult<null>> {
  const auth = await authorize("donations:manage");
  if (!auth.ok) return auth;

  const parsed = rejectDonationSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const { donationId, reason } = parsed.data;
  const institutionId = auth.data.entityId;
  const supabase = await createClient();

  const { data: donation, error: loadError } = await supabase
    .from("donations")
    .select("status, institution_id")
    .eq("id", donationId)
    .maybeSingle();
  if (loadError) return unexpected("[rejectDonation] load", loadError);

  if (!donation || donation.institution_id !== institutionId)
    return fail("NOT_FOUND", "Donación no encontrada");
  if (!canReject(donation, institutionId))
    return fail("CONFLICT", "Solo se pueden rechazar donaciones pendientes");

  const { data: updated, error: updateError } = await supabase
    .from("donations")
    .update({
      status: "rejected",
      date_cancelled: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq("id", donationId)
    .eq("status", "pending")
    .select("id");
  if (updateError) return unexpected("[rejectDonation] update", updateError);
  if (updated.length === 0) return fail("CONFLICT", "La donación ya no está pendiente");

  revalidatePaths([{ path: "/dashboard/donations" }]);
  return { ok: true, data: null };
}
