import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function RedirectUser(): Promise<null> {
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

  if (!onboarded) {
    redirect("/onboarding");
  } else redirect("/dashboard/campaign");
}

// Session/cookie access must happen inside <Suspense> with cacheComponents.
export default function ProtectedPage() {
  return (
    <Suspense fallback={<div>Redirigiendo...</div>}>
      <RedirectUser />
    </Suspense>
  );
}
