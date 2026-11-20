"use server";

import { authorize } from "@/lib/auth/authorize";
import { donorAttachmentPrefix, isAttachmentOf } from "@/lib/policies/attachment";
import { canEditOrCancel } from "@/lib/policies/donation";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { updateDonationSchema, type UpdateDonationInput } from "@/lib/validations";

export async function updateDonation(input: UpdateDonationInput): Promise<ServiceResult<null>> {
  const auth = await authorize("donations:own");
  if (!auth.ok) return auth;

  const parsed = updateDonationSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const { donationId, attachment, ...content } = parsed.data;
  const donorId = auth.data.entityId;
  if (attachment && !isAttachmentOf(attachment.path, donorAttachmentPrefix(donorId)))
    return fail("VALIDATION", "La imagen no es válida");

  const supabase = await createClient();
  const { data: donation, error: loadError } = await supabase
    .from("donations")
    .select("status, donor_id, amount")
    .eq("id", donationId)
    .maybeSingle();
  if (loadError) return unexpected("[updateDonation] load", loadError);

  if (!donation || donation.donor_id !== donorId) return fail("NOT_FOUND", "Donación no encontrada");
  if (!canEditOrCancel(donation, donorId))
    return fail("CONFLICT", "Solo se pueden editar donaciones pendientes");
  if ((donation.amount === null) !== (content.amount === null))
    return fail("VALIDATION", "No se puede cambiar el tipo de la donación");

  const file = attachment && {
    attachment_url: supabase.storage.from("donations").getPublicUrl(attachment.path).data.publicUrl,
    attachment_name: attachment.name || null,
  };

  // El estado esperado va en el WHERE: si una institución la aceptó en el medio, no actualiza.
  const { data: updated, error: updateError } = await supabase
    .from("donations")
    .update({
      delivery_method: content.deliveryMethod,
      category: content.category,
      name: content.name || null,
      description: content.description || null,
      amount: content.amount,
      ...file,
    })
    .eq("id", donationId)
    .eq("status", "pending")
    .select("id");
  if (updateError) return unexpected("[updateDonation] update", updateError);
  if (updated.length === 0) return fail("CONFLICT", "La donación ya no está pendiente");

  revalidatePaths([{ path: "/dashboard/donations" }]);
  return { ok: true, data: null };
}
