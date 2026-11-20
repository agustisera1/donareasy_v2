"use server";

import { authorize } from "@/lib/auth/authorize";
import { canEditOrCancel } from "@/lib/policies/donation";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { donationIdSchema, type DonationIdInput } from "@/lib/validations";

export async function cancelDonation(input: DonationIdInput): Promise<ServiceResult<null>> {
  const auth = await authorize("donations:own");
  if (!auth.ok) return auth;

  const parsed = donationIdSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const { donationId } = parsed.data;
  const donorId = auth.data.entityId;
  const supabase = await createClient();

  const { data: donation, error: loadError } = await supabase
    .from("donations")
    .select("status, donor_id")
    .eq("id", donationId)
    .maybeSingle();
  if (loadError) return unexpected("[cancelDonation] load", loadError);

  if (!donation || donation.donor_id !== donorId) return fail("NOT_FOUND", "Donación no encontrada");
  if (!canEditOrCancel(donation, donorId))
    return fail("CONFLICT", "Solo se pueden cancelar donaciones pendientes");

  const { data: deleted, error: deleteError } = await supabase
    .from("donations")
    .delete()
    .eq("id", donationId)
    .eq("status", "pending")
    .select("id");
  if (deleteError) return unexpected("[cancelDonation] delete", deleteError);
  if (deleted.length === 0) return fail("CONFLICT", "La donación ya no está pendiente");

  revalidatePaths([{ path: "/dashboard/donations" }]);
  return { ok: true, data: null };
}
