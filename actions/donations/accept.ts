"use server";

import { authorize } from "@/lib/auth/authorize";
import { canAccept, isAddressedTo } from "@/lib/policies/donation";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { donationIdSchema, type DonationIdInput } from "@/lib/validations";

export async function acceptDonation(input: DonationIdInput): Promise<ServiceResult<null>> {
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
  if (loadError) return unexpected("[acceptDonation] load", loadError);

  // Una donación dirigida a otra institución se lee igual que una inexistente.
  if (!donation || !isAddressedTo(donation, institutionId))
    return fail("NOT_FOUND", "Donación no encontrada");
  if (!canAccept(donation, institutionId))
    return fail("CONFLICT", "Solo se pueden aceptar donaciones pendientes");

  // El estado esperado va en el WHERE: si otra institución ganó la carrera, no actualiza nada.
  const { data: updated, error: updateError } = await supabase
    .from("donations")
    .update({
      status: "accepted",
      date_accepted: new Date().toISOString(),
      institution_id: institutionId,
    })
    .eq("id", donationId)
    .eq("status", "pending")
    .select("id");
  if (updateError) return unexpected("[acceptDonation] update", updateError);
  if (updated.length === 0) return fail("CONFLICT", "La donación ya fue tomada por otra institución");

  revalidatePaths([{ path: "/dashboard/donations" }]);
  return { ok: true, data: null };
}
