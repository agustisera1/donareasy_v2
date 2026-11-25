import "server-only";

import { cacheLife } from "next/cache";
import { authorize, type Actor } from "@/lib/auth/authorize";
import { createClient } from "@/lib/supabase/server";
import { unexpected, type ServiceResult } from "@/lib/shared/result";
import type { DonationWithRelations } from "@/lib/types";

const MAX_DONATIONS = 100;

// La RLS ya recorta: el donante ve las suyas; la institución, las dirigidas a ella y las abiertas.
export async function listDonations(): Promise<ServiceResult<{ donations: DonationWithRelations[]; actor: Actor }>> {
  "use cache: private";
  cacheLife("minutes");

  const auth = await authorize("donations:list");
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations")
    .select("*, campaign:campaigns(type), donor:donors(name, lastname, phone)")
    .order("date_created", { ascending: false })
    .limit(MAX_DONATIONS);
  if (error) return unexpected("[listDonations]", error);
  return { ok: true, data: { donations: data, actor: auth.data } };
}
