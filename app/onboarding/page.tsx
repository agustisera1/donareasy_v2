import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OnboardingForms } from "@/components/onboarding/onboarding-forms";
import { PendingApproval } from "@/components/onboarding/pending-approval";
import { getAccountStatus } from "@/queries/user/get-account-status";

export const metadata: Metadata = { title: "Completá tu perfil" };

async function OnboardingContent() {
  const status = await getAccountStatus();
  if (!status.ok)
    return (
      <p className="p-6 text-sm text-muted-foreground">
        No se pudo cargar tu cuenta. Recargá la página.
      </p>
    );

  if (status.data === "active") redirect("/dashboard/campaigns");
  if (status.data === "pending") return <PendingApproval />;
  return <OnboardingForms />;
}

// Session/cookie access must happen inside <Suspense> with cacheComponents.
export default function OnboardingPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Cargando</p>}>
      <OnboardingContent />
    </Suspense>
  );
}
