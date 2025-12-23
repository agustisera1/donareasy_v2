import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function redirectUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const {
    data: { onboarding_complete: onboarded },
  } = (await supabase
    .from("users")
    .select("onboarding_complete")
    .eq("id", data?.claims?.sub)
    .single()) as { data: { onboarding_complete: boolean } };

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  console.log({ onboarded });
  if (!onboarded) {
    redirect("/onboarding");
  } else redirect("/dashboard/campaign");
}

export default async function ProtectedPage() {
  await redirectUser();
  return <Suspense fallback={<div>Redirigiendo...</div>} />;
}
