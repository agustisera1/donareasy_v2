import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { InstitutionMetrics } from "@/components/institutions/institution-metrics";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyInstitutionMetrics } from "@/queries/metrics/get-my-institution-metrics";

export const metadata: Metadata = { title: "Métricas" };

export default function MetricsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <MetricsSection />
    </Suspense>
  );
}

async function MetricsSection() {
  const result = await getMyInstitutionMetrics();
  if (!result.ok && result.code === "FORBIDDEN") redirect("/dashboard");
  if (!result.ok)
    return <p className="text-sm text-muted-foreground">No se pudieron cargar las métricas. Recargá la página.</p>;
  return <InstitutionMetrics metrics={result.data} />;
}
