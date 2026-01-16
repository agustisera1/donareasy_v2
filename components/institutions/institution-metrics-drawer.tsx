"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useInstitutionsContext } from "@/contexts/institutions-context";

export function InstitutionMetricsDrawer() {
  const { metricsDrawerOpen, closeMetricsDrawer, selectedInstitution } =
    useInstitutionsContext();

  if (!selectedInstitution) {
    return null;
  }

  return (
    <Drawer
      direction="right"
      open={metricsDrawerOpen}
      onOpenChange={closeMetricsDrawer}
    >
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
          <DrawerTitle>Métricas de {selectedInstitution.name}</DrawerTitle>
          <DrawerDescription>
            Información sobre las métricas de la institución
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4">
          <p className="text-sm text-muted-foreground">
            Las métricas de la institución se mostrarán aquí próximamente.
          </p>
        </div>

        <DrawerFooter className="border-t">
          <Button className="w-1/2 mx-auto" onClick={closeMetricsDrawer}>
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
