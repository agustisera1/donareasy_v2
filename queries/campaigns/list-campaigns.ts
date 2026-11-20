import "server-only";

import { authorize, type Actor } from "@/lib/auth/authorize";
import { createClient } from "@/lib/supabase/server";
import { unexpected, type ServiceResult } from "@/lib/shared/result";
import type { CampaignWithInstitution } from "@/lib/types";

const MAX_CAMPAIGNS = 100;

export type CampaignsView = "all" | "mine";

export async function listCampaigns(
  view: CampaignsView,
): Promise<ServiceResult<{ campaigns: CampaignWithInstitution[]; actor: Actor }>> {
  const auth = await authorize("campaigns:list");
  if (!auth.ok) return auth;

  const supabase = await createClient();
  let query = supabase
    .from("campaigns")
    .select("*, institution:institutions(name)")
    .order("start_date", { ascending: false })
    .limit(MAX_CAMPAIGNS);
  if (view === "mine" && auth.data.role === "institution")
    query = query.eq("institution_id", auth.data.entityId);

  const { data, error } = await query;
  if (error) return unexpected("[listCampaigns]", error);
  return { ok: true, data: { campaigns: data, actor: auth.data } };
}
