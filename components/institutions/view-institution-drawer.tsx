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
import { formatDate } from "@/lib/utils";
import { Fragment } from "react";

export function ViewInstitutionDrawer() {
  const { viewDrawerOpen, closeViewDrawer, selectedInstitution } =
    useInstitutionsContext();

  if (!selectedInstitution) {
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
          <DrawerTitle>Detalles de la institución</DrawerTitle>
          <DrawerDescription>
            Información registrada de la institución
          </DrawerDescription>
        </DrawerHeader>

        <div className="grid grid-cols-2 gap-4 p-4">
          <span className="text-sm font-medium">Nombre</span>
          <span className="text-sm">{selectedInstitution.name}</span>

          <span className="text-sm font-medium">Director</span>
          <span className="text-sm">{selectedInstitution.director}</span>

          <span className="text-sm font-medium">Dirección</span>
          <span className="text-sm">{selectedInstitution.address}</span>

          <span className="text-sm font-medium">Provincia</span>
          <span className="text-sm">{selectedInstitution.province}</span>

          <span className="text-sm font-medium">Ciudad</span>
          <span className="text-sm">{selectedInstitution.city}</span>

          <span className="text-sm font-medium">Teléfono</span>
          <span className="text-sm">{selectedInstitution.phone}</span>

          <span className="text-sm font-medium">Fecha de fundación</span>
          <span className="text-sm">
            {formatDate(selectedInstitution.foundation_date)}
          </span>

          {selectedInstitution.bank && (
            <Fragment>
              <span className="text-sm font-medium">Alias | CBU</span>
              <span className="text-sm">{selectedInstitution.bank}</span>
            </Fragment>
          )}

          {selectedInstitution.lore && (
            <Fragment>
              <span className="text-sm font-medium">Historia</span>
              <span className="text-sm col-span-2">
                {selectedInstitution.lore}
              </span>
            </Fragment>
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
