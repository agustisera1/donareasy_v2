import { Suspense } from "react";
import type { Metadata } from "next";

import { DonationsDataTable } from "@/components/donations/donations-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { listDonations } from "@/queries/donations/list-donations";
import { listInstitutions } from "@/queries/institutions/list-institutions";

export const metadata: Metadata = { title: "Donaciones" };

type SearchParams = { campaign_id?: string; institution_id?: string };
type PageProps = { searchParams: Promise<SearchParams> };

export default function DonationsPage({ searchParams }: PageProps) {
  return (
    <div className="w-full max-w-6xl p-6 space-y-6">
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <DonationsSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DonationsSection({ searchParams }: PageProps) {
  const params = await searchParams;
  const [result, institutions] = await Promise.all([listDonations(), listInstitutions()]);
  const actor = result.ok ? result.data.actor : null;
  const campaign =
    actor?.role === "donor" && params.campaign_id && params.institution_id
      ? { campaignId: params.campaign_id, institutionId: params.institution_id }
      : null;

  return (
    <DonationsDataTable
      rows={result.ok ? result.data.donations : null}
      actor={actor ? { role: actor.role, entityId: actor.entityId } : null}
      institutions={institutions.ok ? institutions.data.map(({ id, name }) => ({ id, name })) : []}
      campaign={campaign}
    />
  );
}
