import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { guestTokenState, type GuestTokenState } from "@/lib/policies/guest-token";

export type GuestToken = { id: string; name: string; state: GuestTokenState };

// Excepción pública de `authorize`: el token del link es la credencial del invitado.
export async function getGuestToken(token: string): Promise<ServiceResult<GuestToken>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("guest_tokens")
    .select("id, name, used_at, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (error) return unexpected("[getGuestToken]", error);
  if (!data) return fail("NOT_FOUND", "Este enlace no existe o ya no es válido");

  return {
    ok: true,
    data: { id: data.id, name: data.name, state: guestTokenState(data, new Date()) },
  };
}
