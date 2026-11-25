"use server";

import { redirect } from "next/navigation";
import { unexpected, type ServiceResult } from "@/lib/shared/result";
import { revalidatePaths } from "@/lib/shared/revalidate";
import { createClient } from "@/lib/supabase/server";

// Sin authorize: también cierra sesión quien todavía no tiene rol.
export async function signOut(): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return unexpected("[signOut]", error);

  revalidatePaths([{ path: "/", type: "layout" }]);
  redirect("/auth/login");
}
