import "server-only";

import { cacheLife } from "next/cache";
import { authorize } from "@/lib/auth/authorize";
import type { ServiceResult } from "@/lib/shared/result";
import { createClient } from "@/lib/supabase/server";
import type { DonationMetrics } from "@/lib/types";
import { loadDonationMetrics } from "./shared";

export async function getMyInstitutionMetrics(): Promise<ServiceResult<DonationMetrics>> {
  "use cache: private";
  cacheLife("minutes");

  const auth = await authorize("donations:manage");
  if (!auth.ok) return auth;

  const supabase = await createClient();
  return loadDonationMetrics(supabase, "full", auth.data.entityId);
}
