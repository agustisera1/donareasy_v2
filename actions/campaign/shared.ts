import "server-only";

import { fail, unexpected } from "@/lib/shared/result";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Un update con guard que no tocó filas: distingue campaña ajena/inexistente de una ya finalizada.
export async function explainUnchangedCampaign(
  supabase: Supabase,
  campaignId: string,
  institutionId: string,
  verb: "editar" | "finalizar",
) {
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("institution_id, finished")
    .eq("id", campaignId)
    .maybeSingle();
  if (error) return unexpected(`[campaign:${verb}] load`, error);
  if (!campaign || campaign.institution_id !== institutionId)
    return fail("NOT_FOUND", "Campaña no encontrada");
  return fail("CONFLICT", `No se puede ${verb} una campaña finalizada`);
}
