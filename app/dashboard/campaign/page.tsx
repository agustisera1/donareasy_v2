import { Suspense } from "react";
import type { Metadata } from "next";

import { CampaignsDataTable } from "@/components/campaigns/campaigns-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { listCampaigns, type CampaignsView } from "@/queries/campaigns/list-campaigns";

export const metadata: Metadata = { title: "Campañas" };

type PageProps = { searchParams: Promise<{ view?: string }> };

export default function CampaignPage({ searchParams }: PageProps) {
  return (
    <div className="w-full max-w-6xl p-6 space-y-6">
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CampaignsSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CampaignsSection({ searchParams }: PageProps) {
  const { view: rawView } = await searchParams;
  const view: CampaignsView = rawView === "mine" ? "mine" : "all";
  const result = await listCampaigns(view);

  return (
    <CampaignsDataTable
      rows={result.ok ? result.data.campaigns : null}
      actor={result.ok ? { role: result.data.actor.role, entityId: result.data.actor.entityId } : null}
      view={view}
    />
  );
}
