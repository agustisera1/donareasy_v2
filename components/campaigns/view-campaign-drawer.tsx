"use client";

import { Button } from "@/components/ui/button";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { useCampaignsContext } from "@/contexts/campaigns-context";
import { formatDate } from "@/lib/utils";

export function ViewCampaignDrawer() {
  const { viewDrawerOpen, closeViewDrawer, selectedCampaign } =
    useCampaignsContext();

  if (!selectedCampaign) {
    return null;
  }

  return (
    <DrawerLayout
      open={viewDrawerOpen}
      onOpenChange={closeViewDrawer}
      title="Detalles de la campaña"
      description="Información registrada de la campaña"
      footer={<Button onClick={closeViewDrawer}>Cerrar</Button>}
    >
      <DetailList>
        <DetailItem label="Nombre">{selectedCampaign.type}</DetailItem>
        <DetailItem label="Fecha de inicio">
          {formatDate(selectedCampaign.start_date)}
        </DetailItem>
        <DetailItem label="Fecha de finalización">
          {selectedCampaign.termination_date
            ? formatDate(selectedCampaign.termination_date)
            : "Campaña activa"}
        </DetailItem>
        {selectedCampaign.description && (
          <DetailItem label="Descripción" stacked>
            {selectedCampaign.description}
          </DetailItem>
        )}
      </DetailList>
    </DrawerLayout>
  );
}
