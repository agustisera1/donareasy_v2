import "server-only";

import { authorize } from "@/lib/auth/authorize";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { createClient } from "@/lib/supabase/server";
import type { DonationMetrics } from "@/lib/types";
import { campaignMetricsSchema, type CampaignMetricsInput } from "@/lib/validations";
import { loadDonationMetrics } from "./shared";

export async function getCampaignMetrics(
  input: CampaignMetricsInput,
): Promise<ServiceResult<DonationMetrics>> {
  const auth = await authorize("campaigns:list");
  if (!auth.ok) return auth;

  const parsed = campaignMetricsSchema.safeParse(input);
  if (!parsed.success) return fail("NOT_FOUND", "Campaña no encontrada");
  const { campaignId } = parsed.data;

  const supabase = await createClient();
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("institution_id")
    .eq("id", campaignId)
    .maybeSingle();
  if (error) return unexpected("[getCampaignMetrics] load", error);
  if (!campaign) return fail("NOT_FOUND", "Campaña no encontrada");

  const scope = campaign.institution_id === auth.data.entityId ? "full" : "public";
  return loadDonationMetrics(supabase, scope, campaign.institution_id, campaignId);
}
