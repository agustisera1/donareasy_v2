"use client";

import { Suspense } from "react";
import { CampaignsProvider } from "@/contexts/campaigns-context";
import { CreateCampaignDrawer } from "@/components/campaigns/create-campaign-drawer";
import { CampaignsDataTable } from "@/components/campaigns/campaigns-data-table";

export default function CampaignPage() {
  return (
    <CampaignsProvider>
      <div className="w-full max-w-6xl p-6 space-y-6">
        <CreateCampaignDrawer />
        <Suspense fallback={<div>...</div>}>
          <CampaignsDataTable />
        </Suspense>
      </div>
    </CampaignsProvider>
  );
}
