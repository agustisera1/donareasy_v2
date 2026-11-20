import "server-only";

import { authorize, type Actor } from "@/lib/auth/authorize";
import { createClient } from "@/lib/supabase/server";
import { unexpected, type ServiceResult } from "@/lib/shared/result";
import type { CampaignWithInstitution } from "@/lib/types";

const MAX_CAMPAIGNS = 100;

export async function listCampaigns(): Promise<ServiceResult<{ campaigns: CampaignWithInstitution[]; actor: Actor }>> {
  const auth = await authorize("campaigns:list");
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, institution:institutions(name)")
    .order("start_date", { ascending: false })
    .limit(MAX_CAMPAIGNS);
  if (error) return unexpected("[listCampaigns]", error);
  return { ok: true, data: { campaigns: data, actor: auth.data } };
}
