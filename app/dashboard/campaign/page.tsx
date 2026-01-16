"use client";

import { Suspense } from "react";
import { CampaignsProvider } from "@/contexts/campaigns-context";
import { CreateCampaignDrawer } from "@/components/campaigns/create-campaign-drawer";
import { CampaignsDataTable } from "@/components/campaigns/campaigns-data-table";

export default function CampaignPage() {
  return (
    <CampaignsProvider>
      <div className="w-full max-w-6xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Campañas</h1>
          <p className="text-muted-foreground mt-2">
            Visualiza y gestiona las campañas de donación activas
          </p>
        </div>

        <CreateCampaignDrawer />
        <Suspense fallback={<div>...</div>}>
          <CampaignsDataTable />
        </Suspense>
      </div>
    </CampaignsProvider>
  );
}
