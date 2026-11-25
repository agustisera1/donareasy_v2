import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { unexpected, type ServiceResult } from "@/lib/shared/result";

export type AccountStatus = "onboarding" | "pending" | "active";

// Sin authorize: el estado de cuenta es previo al rol. Sin sesión, va al login.
export const getAccountStatus = cache(
  async (): Promise<ServiceResult<AccountStatus>> => {
    // getUser() usa Date.now() internamente: se excluye del prerender.
    await connection();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const [account, institution] = await Promise.all([
      supabase.from("users").select("onboarding_complete").eq("id", user.id).maybeSingle(),
      supabase.from("institutions").select("approved").eq("user_id", user.id).maybeSingle(),
    ]);
    if (account.error) return unexpected("[getAccountStatus] user", account.error);
    if (institution.error) return unexpected("[getAccountStatus] institution", institution.error);

    if (!account.data?.onboarding_complete) return { ok: true, data: "onboarding" };
    if (institution.data && !institution.data.approved) return { ok: true, data: "pending" };
    return { ok: true, data: "active" };
  }
);
