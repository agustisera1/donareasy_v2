"use client";

import { Suspense } from "react";
import { DonationsProvider } from "@/contexts/donations-context";
import { DonationsDataTable } from "@/components/donations/donations-data-table";

export default function DonationsPage() {
  return (
    <DonationsProvider>
      <div className="w-full max-w-6xl p-6 space-y-6">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando</p>}>
          <DonationsDataTable />
        </Suspense>
      </div>
    </DonationsProvider>
  );
}
