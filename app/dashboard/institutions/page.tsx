"use client";

import { Suspense } from "react";
import { InstitutionsProvider } from "@/contexts/institutions-context";
import { InstitutionsDataTable } from "@/components/institutions/institutions-data-table";

export default function InstitutionsPage() {
  return (
    <InstitutionsProvider>
      <div className="w-full max-w-5xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Instituciones</h1>
          <p className="text-muted-foreground mt-2">
            Visualiza las instituciones registradas en el sistema
          </p>
        </div>

        <Suspense fallback={<div>...</div>}>
          <InstitutionsDataTable />
        </Suspense>
      </div>
    </InstitutionsProvider>
  );
}
