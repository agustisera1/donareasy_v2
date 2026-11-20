"use server";

import { authorize } from "@/lib/auth/authorize";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { createDonationSchema, type CreateDonationInput } from "@/lib/validations";

export async function createDonation(
  input: CreateDonationInput,
): Promise<ServiceResult<{ id: number }>> {
  const auth = await authorize("donations:create");
  if (!auth.ok) return auth;

  const parsed = createDonationSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const data = parsed.data;
  const supabase = await createClient();

  if (data.institutionId) {
    const { data: institution, error } = await supabase
      .from("institutions")
      .select("id")
      .eq("id", data.institutionId)
      .eq("approved", true)
      .maybeSingle();
    if (error) return unexpected("[createDonation] institution", error);
    if (!institution) return fail("NOT_FOUND", "Institución no encontrada");
  }

  if (data.campaignId) {
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("institution_id, finished")
      .eq("id", data.campaignId)
      .maybeSingle();
    if (error) return unexpected("[createDonation] campaign", error);
    if (!campaign || campaign.institution_id !== data.institutionId)
      return fail("NOT_FOUND", "Campaña no encontrada");
    if (campaign.finished) return fail("CONFLICT", "La campaña ya finalizó");
  }

  const { data: donation, error } = await supabase
    .from("donations")
    .insert({
      donor_id: auth.data.entityId,
      institution_id: data.institutionId,
      campaign_id: data.campaignId ?? null,
      status: "pending",
      delivery_method: data.deliveryMethod,
      category: data.category,
      name: data.name || null,
      description: data.description || null,
      amount: data.amount,
      attachment_url: data.attachmentUrl,
      attachment_name: data.attachmentName,
    })
    .select("id")
    .single();
  if (error) return unexpected("[createDonation] insert", error);

  revalidatePaths([{ path: "/dashboard/donations" }]);
  return { ok: true, data: donation };
}
