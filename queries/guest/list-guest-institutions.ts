import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { getGuestToken } from "./get-guest-token";

const MAX_INSTITUTIONS = 100;

// Excepción pública de `authorize`: solo con un link de invitado vigente.
export async function listGuestInstitutions(
  token: string,
): Promise<ServiceResult<{ id: string; name: string }[]>> {
  const guest = await getGuestToken(token);
  if (!guest.ok) return guest;
  if (guest.data.state !== "valid") return fail("CONFLICT", "Este enlace ya no es válido");

  const { data, error } = await createAdminClient()
    .from("institutions")
    .select("id, name")
    .eq("approved", true)
    .order("name")
    .limit(MAX_INSTITUTIONS);
  if (error) return unexpected("[listGuestInstitutions]", error);
  return { ok: true, data };
}
