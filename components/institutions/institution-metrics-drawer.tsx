"use client";

import { DrawerLayout } from "@/components/common/drawer-layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstitutionMetrics } from "@/hooks/use-institution-metrics";
import type { Institution } from "@/lib/types";
import { InstitutionMetrics } from "./institution-metrics";

interface InstitutionMetricsDrawerProps {
  institution: Institution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstitutionMetricsDrawer({ institution, open, onOpenChange }: InstitutionMetricsDrawerProps) {
  const { data: metrics, isPending, isError } = useInstitutionMetrics(institution.id, open);

  return (
    <DrawerLayout
      open={open}
      onOpenChange={onOpenChange}
      title={`Métricas de ${institution.name}`}
      description="Resumen de las donaciones que recibe la institución"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
      className="data-[vaul-drawer-direction=right]:sm:max-w-2xl"
    >
      {isError ? (
        <p className="text-sm text-muted-foreground">No se pudieron cargar las métricas. Recargá la página.</p>
      ) : isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <InstitutionMetrics metrics={metrics} />
      )}
    </DrawerLayout>
  );
}
