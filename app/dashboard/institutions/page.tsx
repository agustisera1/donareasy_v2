"use client";

import { Suspense } from "react";
import { InstitutionsProvider } from "@/contexts/institutions-context";
import { InstitutionsDataTable } from "@/components/institutions/institutions-data-table";

export default function InstitutionsPage() {
  return (
    <InstitutionsProvider>
      <div className="w-full max-w-6xl p-6 space-y-6">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando</p>}>
          <InstitutionsDataTable />
        </Suspense>
      </div>
    </InstitutionsProvider>
  );
}
