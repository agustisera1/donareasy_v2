import "server-only";

import { cacheLife } from "next/cache";
import { authorize } from "@/lib/auth/authorize";
import { createClient } from "@/lib/supabase/server";
import { unexpected, type ServiceResult } from "@/lib/shared/result";
import type { Institution } from "@/lib/types";

const MAX_INSTITUTIONS = 100;

export async function listInstitutions(): Promise<ServiceResult<Institution[]>> {
  "use cache: private";
  cacheLife("minutes");

  const auth = await authorize("institutions:list");
  if (!auth.ok) return auth;

  const supabase = await createClient();
  let query = supabase.from("institutions").select("*").eq("approved", true);
  if (auth.data.role === "institution") query = query.neq("id", auth.data.entityId);

  const { data, error } = await query.order("name").limit(MAX_INSTITUTIONS);
  if (error) return unexpected("[listInstitutions]", error);
  return { ok: true, data };
}
