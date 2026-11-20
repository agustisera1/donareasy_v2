import "server-only";

import { createClient } from "@/lib/supabase/server";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import type { RoleName } from "@/lib/types";

const PERMISSIONS = {
  "institutions:list": ["donor", "institution"],
  "donations:list": ["donor", "institution"],
  "donations:create": ["donor"],
  "donations:own": ["donor"],
  "donations:manage": ["institution"],
  "campaigns:list": ["donor", "institution"],
  "campaigns:manage": ["institution"],
} as const satisfies Record<string, readonly RoleName[]>;

export type Permission = keyof typeof PERMISSIONS;
export type Actor = { userId: string; role: RoleName; entityId: string };

type ActorRow = {
  roles: { name: RoleName } | null;
};

export async function authorize(permission: Permission): Promise<ServiceResult<Actor>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("UNAUTHORIZED", "Iniciá sesión para continuar");

  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .maybeSingle<ActorRow>();
  if (roleError) return unexpected("[authorize] role", roleError);

  const role = userRole?.roles?.name;
  if (!role) return fail("FORBIDDEN", "Tu cuenta no tiene un perfil asignado");

  const entity = await (role === "institution"
    ? supabase.from("institutions").select("id, approved").eq("user_id", user.id).maybeSingle()
    : supabase.from("donors").select("id").eq("user_id", user.id).maybeSingle());
  if (entity.error) return unexpected("[authorize] entity", entity.error);
  if (!entity.data) return fail("FORBIDDEN", "Tu cuenta no tiene un perfil asignado");
  if ("approved" in entity.data && !entity.data.approved)
    return fail("FORBIDDEN", "Tu cuenta institucional está en revisión");

  const allowed: readonly RoleName[] = PERMISSIONS[permission];
  if (!allowed.includes(role)) return fail("FORBIDDEN", "No tenés permiso para hacer esto");

  return { ok: true, data: { userId: user.id, role, entityId: entity.data.id } };
}
