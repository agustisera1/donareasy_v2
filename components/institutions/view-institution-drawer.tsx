"use client";

import { Button } from "@/components/ui/button";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import type { Institution } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ViewInstitutionDrawerProps {
  institution: Institution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewInstitutionDrawer({ institution, open, onOpenChange }: ViewInstitutionDrawerProps) {
  return (
    <DrawerLayout
      open={open}
      onOpenChange={onOpenChange}
      title="Detalles de la institución"
      description="Información registrada de la institución"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
    >
      <DetailList>
        <DetailItem label="Nombre">{institution.name}</DetailItem>
        <DetailItem label="Director">{institution.director}</DetailItem>
        <DetailItem label="Dirección">{institution.address}</DetailItem>
        <DetailItem label="Provincia">{institution.province}</DetailItem>
        <DetailItem label="Ciudad">{institution.city}</DetailItem>
        <DetailItem label="Teléfono">{institution.phone}</DetailItem>
        <DetailItem label="Fecha de fundación">{formatDate(institution.foundation_date)}</DetailItem>
        {institution.bank && <DetailItem label="Alias | CBU">{institution.bank}</DetailItem>}
        {institution.lore && (
          <DetailItem label="Historia" stacked>
            {institution.lore}
          </DetailItem>
        )}
      </DetailList>
    </DrawerLayout>
  );
}
