"use client";

import { Button } from "@/components/ui/button";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import type { CampaignWithInstitution } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CampaignStatusBadge } from "./campaign-status-badge";

interface ViewCampaignDrawerProps {
  campaign: CampaignWithInstitution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewCampaignDrawer({ campaign, open, onOpenChange }: ViewCampaignDrawerProps) {
  return (
    <DrawerLayout
      open={open}
      onOpenChange={onOpenChange}
      title="Detalles de la campaña"
      description="Información registrada de la campaña"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
    >
      <DetailList>
        <DetailItem label="Nombre">{campaign.type}</DetailItem>
        {campaign.institution && (
          <DetailItem label="Institución">{campaign.institution.name}</DetailItem>
        )}
        <DetailItem label="Estado">
          <CampaignStatusBadge finished={campaign.finished} />
        </DetailItem>
        <DetailItem label="Fecha de inicio">{formatDate(campaign.start_date)}</DetailItem>
        <DetailItem label="Fecha de finalización">
          {campaign.termination_date ? formatDate(campaign.termination_date) : "Sin especificar"}
        </DetailItem>
        <DetailItem label="Descripción" stacked>
          {campaign.description}
        </DetailItem>
      </DetailList>
    </DrawerLayout>
  );
}
