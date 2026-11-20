"use server";

import { authorize } from "@/lib/auth/authorize";
import { canDeliver } from "@/lib/policies/donation";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { donationIdSchema, type DonationIdInput } from "@/lib/validations";

export async function deliverDonation(input: DonationIdInput): Promise<ServiceResult<null>> {
  const auth = await authorize("donations:manage");
  if (!auth.ok) return auth;

  const parsed = donationIdSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const { donationId } = parsed.data;
  const institutionId = auth.data.entityId;
  const supabase = await createClient();

  const { data: donation, error: loadError } = await supabase
    .from("donations")
    .select("status, institution_id")
    .eq("id", donationId)
    .maybeSingle();
  if (loadError) return unexpected("[deliverDonation] load", loadError);

  if (!donation || donation.institution_id !== institutionId)
    return fail("NOT_FOUND", "Donación no encontrada");
  if (!canDeliver(donation, institutionId))
    return fail("CONFLICT", "Solo se pueden marcar como entregadas las donaciones aceptadas");

  const { data: updated, error: updateError } = await supabase
    .from("donations")
    .update({ status: "delivered", dellivered_date: new Date().toISOString() })
    .eq("id", donationId)
    .eq("status", "accepted")
    .select("id");
  if (updateError) return unexpected("[deliverDonation] update", updateError);
  if (updated.length === 0) return fail("CONFLICT", "La donación ya no está aceptada");

  revalidatePaths([{ path: "/dashboard/donations" }]);
  return { ok: true, data: null };
}
