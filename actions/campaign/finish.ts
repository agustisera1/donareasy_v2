"use server";

import { authorize } from "@/lib/auth/authorize";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { finishCampaignSchema, type FinishCampaignInput } from "@/lib/validations";
import { explainUnchangedCampaign } from "./shared";

export async function finishCampaign(input: FinishCampaignInput): Promise<ServiceResult<null>> {
  const auth = await authorize("campaigns:manage");
  if (!auth.ok) return auth;

  const parsed = finishCampaignSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const { campaignId } = parsed.data;
  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("campaigns")
    .update({ finished: true, termination_date: new Date().toISOString().slice(0, 10) })
    .eq("id", campaignId)
    .eq("institution_id", auth.data.entityId)
    .eq("finished", false)
    .select("id");
  if (error) return unexpected("[finishCampaign] update", error);
  if (updated.length === 0)
    return explainUnchangedCampaign(supabase, campaignId, auth.data.entityId, "finalizar");

  revalidatePaths([{ path: "/dashboard/campaigns" }]);
  return { ok: true, data: null };
}
