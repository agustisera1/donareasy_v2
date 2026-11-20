"use server";

import { authorize } from "@/lib/auth/authorize";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { createCampaignSchema, type CreateCampaignInput } from "@/lib/validations";

export async function createCampaign(
  input: CreateCampaignInput,
): Promise<ServiceResult<{ id: string }>> {
  const auth = await authorize("campaigns:manage");
  if (!auth.ok) return auth;

  const parsed = createCampaignSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const { type, description, quantity, termination_date } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      type,
      description,
      quantity: quantity || null,
      termination_date: termination_date || null,
      start_date: new Date().toISOString().slice(0, 10),
      finished: false,
      institution_id: auth.data.entityId,
    })
    .select("id")
    .single();
  if (error) return unexpected("[createCampaign] insert", error);

  revalidatePaths([{ path: "/dashboard/campaign" }]);
  return { ok: true, data };
}
