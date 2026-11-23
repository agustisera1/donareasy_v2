"use client";

import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/common/detail-card";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { StatCard } from "@/components/common/stat-card";
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
      title={campaign.type}
      description="Información registrada de la campaña"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
      wide
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard size="sm" label="Institución" value={campaign.institution?.name ?? "—"} />
          <StatCard size="sm" label="Inicio" value={formatDate(campaign.start_date, "short")} />
          <StatCard
            size="sm"
            label="Finalización"
            value={campaign.termination_date ? formatDate(campaign.termination_date, "short") : "Sin especificar"}
          />
        </div>
        <DetailCard title="Sobre la campaña" icon={<Megaphone />}>
          <div className="space-y-3">
            <DetailList>
              <DetailItem label="Estado">
                <CampaignStatusBadge finished={campaign.finished} />
              </DetailItem>
            </DetailList>
            <p className="whitespace-pre-line text-muted-foreground">{campaign.description}</p>
          </div>
        </DetailCard>
      </div>
    </DrawerLayout>
  );
}
