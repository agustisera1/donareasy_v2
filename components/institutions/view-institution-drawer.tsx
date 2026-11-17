"use client";

import { Button } from "@/components/ui/button";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { useInstitutionsContext } from "@/contexts/institutions-context";
import { formatDate } from "@/lib/utils";

export function ViewInstitutionDrawer() {
  const { viewDrawerOpen, closeViewDrawer, selectedInstitution } =
    useInstitutionsContext();

  if (!selectedInstitution) {
    return null;
  }

  return (
    <DrawerLayout
      open={viewDrawerOpen}
      onOpenChange={closeViewDrawer}
      title="Detalles de la institución"
      description="Información registrada de la institución"
      footer={<Button onClick={closeViewDrawer}>Cerrar</Button>}
    >
      <DetailList>
        <DetailItem label="Nombre">{selectedInstitution.name}</DetailItem>
        <DetailItem label="Director">{selectedInstitution.director}</DetailItem>
        <DetailItem label="Dirección">{selectedInstitution.address}</DetailItem>
        <DetailItem label="Provincia">{selectedInstitution.province}</DetailItem>
        <DetailItem label="Ciudad">{selectedInstitution.city}</DetailItem>
        <DetailItem label="Teléfono">{selectedInstitution.phone}</DetailItem>
        <DetailItem label="Fecha de fundación">
          {formatDate(selectedInstitution.foundation_date)}
        </DetailItem>
        {selectedInstitution.bank && (
          <DetailItem label="Alias | CBU">{selectedInstitution.bank}</DetailItem>
        )}
        {selectedInstitution.lore && (
          <DetailItem label="Historia" stacked>
            {selectedInstitution.lore}
          </DetailItem>
        )}
      </DetailList>
    </DrawerLayout>
  );
}
