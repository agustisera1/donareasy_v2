"use server";

import { redirect } from "next/navigation";
import { authErrorMessage } from "@/lib/auth-errors";
import { fail, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginInput } from "@/lib/validations";

// Pública: crea la sesión, no hay actor que autorizar.
export async function signIn(input: LoginInput): Promise<ServiceResult<null>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return fail("UNAUTHORIZED", authErrorMessage(error));

  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_complete")
    .eq("id", data.user.id)
    .maybeSingle();

  revalidatePaths([{ path: "/", type: "layout" }]);
  redirect(profile?.onboarding_complete ? "/dashboard" : "/onboarding");
}
