import { Suspense } from "react";
import type { Metadata } from "next";

import { DonationsDataTable } from "@/components/donations/donations-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { listDonations } from "@/queries/donations/list-donations";
import { listInstitutions } from "@/queries/institutions/list-institutions";

export const metadata: Metadata = { title: "Donaciones" };

export default function DonationsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <DonationsSection />
    </Suspense>
  );
}

async function DonationsSection() {
  const [result, institutions] = await Promise.all([listDonations(), listInstitutions()]);
  const actor = result.ok ? result.data.actor : null;

  return (
    <DonationsDataTable
      rows={result.ok ? result.data.donations : null}
      actor={actor ? { role: actor.role, entityId: actor.entityId } : null}
      institutions={institutions.ok ? institutions.data.map(({ id, name }) => ({ id, name })) : []}
    />
  );
}
