import { Suspense } from "react";
import type { Metadata } from "next";

import { InstitutionsDataTable } from "@/components/institutions/institutions-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { listInstitutions } from "@/queries/institutions/list-institutions";

export const metadata: Metadata = { title: "Instituciones" };

export default function InstitutionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <InstitutionsSection />
    </Suspense>
  );
}

async function InstitutionsSection() {
  const result = await listInstitutions();

  return <InstitutionsDataTable rows={result.ok ? result.data : null} />;
}
