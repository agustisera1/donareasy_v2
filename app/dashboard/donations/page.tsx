"use client";

import { Suspense } from "react";
import { DonationsProvider } from "@/contexts/donations-context";
import { DonationsDataTable } from "@/components/donations/donations-data-table";

export default function DonationsPage() {
  return (
    <DonationsProvider>
      <div className="w-full max-w-5xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Donaciones</h1>
          <p className="text-muted-foreground mt-2">
            Visualiza y gestiona las donaciones
          </p>
        </div>

        <Suspense fallback={<div>...</div>}>
          <DonationsDataTable />
        </Suspense>
      </div>
    </DonationsProvider>
  );
}

