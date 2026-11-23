"use client";

import { DrawerLayout } from "@/components/common/drawer-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignMetrics } from "@/hooks/use-campaign-metrics";
import type { CampaignWithInstitution } from "@/lib/types";
import { CampaignMetrics } from "./campaign-metrics";

interface CampaignMetricsDrawerProps {
  campaign: CampaignWithInstitution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignMetricsDrawer({ campaign, open, onOpenChange }: CampaignMetricsDrawerProps) {
  const { data: metrics, isPending, isError } = useCampaignMetrics(campaign.id, open);

  return (
    <DrawerLayout
      open={open}
      onOpenChange={onOpenChange}
      title={`Métricas de ${campaign.type}`}
      description="Resumen de las donaciones hechas a la campaña"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
      wide
    >
      {isError ? (
        <p className="text-sm text-muted-foreground">No se pudieron cargar las métricas. Recargá la página.</p>
      ) : isPending ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <CampaignMetrics metrics={metrics} />
      )}
    </DrawerLayout>
  );
}
