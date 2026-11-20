import { Suspense } from "react";
import type { Metadata } from "next";

import { InstitutionsDataTable } from "@/components/institutions/institutions-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { listInstitutions } from "@/queries/institutions/list-institutions";

export const metadata: Metadata = { title: "Instituciones" };

export default function InstitutionsPage() {
  return (
    <div className="w-full max-w-6xl p-6 space-y-6">
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <InstitutionsSection />
      </Suspense>
    </div>
  );
}

async function InstitutionsSection() {
  const result = await listInstitutions();

  return <InstitutionsDataTable rows={result.ok ? result.data : null} />;
}
