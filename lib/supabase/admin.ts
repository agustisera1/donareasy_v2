import { createClient } from "@supabase/supabase-js";

// Service role: saltea RLS. Solo para el flujo de invitado, donde no hay usuario (regla A4).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
