"use server";

import { authorize } from "@/lib/auth/authorize";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { updateCampaignSchema, type UpdateCampaignInput } from "@/lib/validations";
import { explainUnchangedCampaign } from "./shared";

export async function updateCampaign(input: UpdateCampaignInput): Promise<ServiceResult<null>> {
  const auth = await authorize("campaigns:manage");
  if (!auth.ok) return auth;

  const parsed = updateCampaignSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const { campaignId, type, description, quantity, termination_date } = parsed.data;
  const supabase = await createClient();

  // Dueño y estado esperado en el WHERE: una campaña finalizada o ajena no se toca.
  const { data: updated, error } = await supabase
    .from("campaigns")
    .update({
      type,
      description,
      quantity: quantity || null,
      termination_date: termination_date || null,
    })
    .eq("id", campaignId)
    .eq("institution_id", auth.data.entityId)
    .eq("finished", false)
    .select("id");
  if (error) return unexpected("[updateCampaign] update", error);
  if (updated.length === 0)
    return explainUnchangedCampaign(supabase, campaignId, auth.data.entityId, "editar");

  revalidatePaths([{ path: "/dashboard/campaign" }]);
  return { ok: true, data: null };
}
