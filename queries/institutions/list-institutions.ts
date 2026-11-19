import "server-only";

import { authorize } from "@/lib/auth/authorize";
import { createClient } from "@/lib/supabase/server";
import { unexpected, type ServiceResult } from "@/lib/shared/result";
import type { Institution } from "@/lib/types";

const MAX_INSTITUTIONS = 100;

export async function listInstitutions(): Promise<ServiceResult<Institution[]>> {
  const auth = await authorize("institutions:list");
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("institutions")
    .select("*")
    .eq("approved", true)
    .order("name")
    .limit(MAX_INSTITUTIONS);
  if (error) return unexpected("[listInstitutions]", error);
  return { ok: true, data };
}
