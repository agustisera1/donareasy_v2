import { Suspense } from "react";
import type { Metadata } from "next";

import { CampaignsDataTable } from "@/components/campaigns/campaigns-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { listCampaigns } from "@/queries/campaigns/list-campaigns";

export const metadata: Metadata = { title: "Campañas" };

export default function CampaignsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <CampaignsSection />
    </Suspense>
  );
}

async function CampaignsSection() {
  const result = await listCampaigns();

  return (
    <CampaignsDataTable
      rows={result.ok ? result.data.campaigns : null}
      actor={result.ok ? { role: result.data.actor.role, entityId: result.data.actor.entityId } : null}
    />
  );
}
