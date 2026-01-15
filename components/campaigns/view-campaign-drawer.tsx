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
import { useCampaignsContext } from "@/contexts/campaigns-context";
import { formatDate } from "@/lib/utils";

export function ViewCampaignDrawer() {
  const { viewDrawerOpen, closeViewDrawer, selectedCampaign } =
    useCampaignsContext();

  if (!selectedCampaign) {
    return null;
  }

  return (
    <Drawer
      direction="right"
      open={viewDrawerOpen}
      onOpenChange={closeViewDrawer}
    >
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
          <DrawerTitle>Detalles de la campaña</DrawerTitle>
          <DrawerDescription>
            Información registrada de la campaña
          </DrawerDescription>
        </DrawerHeader>

        <div className="grid grid-cols-2 gap-4 p-4">
          <span className="text-sm font-medium">Nombre</span>
          <span className="text-sm">{selectedCampaign.type}</span>

          <span className="text-sm font-medium">Fecha de inicio</span>
          <span className="text-sm">
            {formatDate(selectedCampaign.start_date)}
          </span>

          <span className="text-sm font-medium">Fecha de finalización</span>
          <span className="text-sm">
            {selectedCampaign.termination_date
              ? formatDate(selectedCampaign.termination_date)
              : "Campaña activa"}
          </span>

          {selectedCampaign.description && (
            <>
              <span className="text-sm font-medium">Descripción</span>
              <span className="text-sm col-span-2">
                {selectedCampaign.description}
              </span>
            </>
          )}
        </div>

        <DrawerFooter className="border-t">
          <Button className="w-1/2 mx-auto" onClick={closeViewDrawer}>
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
