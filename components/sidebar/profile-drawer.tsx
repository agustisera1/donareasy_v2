"use client";

import { Button } from "@/components/ui/button";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { DonorData, InstitutionData } from "@/app/api/user/route";
import { formatDate } from "@/lib/utils";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DonorData | InstitutionData | null;
}

export function ProfileDrawer({
  open,
  onOpenChange,
  user,
}: ProfileDrawerProps) {
  return (
    <DrawerLayout
      open={open}
      onOpenChange={onOpenChange}
      title="Cuenta"
      description="Datos del usuario"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
    >
      {user?.role === "donor" ? (
        <DetailList>
          <DetailItem label="Nombre">{user.name}</DetailItem>
          <DetailItem label="Apellido">{user.lastname}</DetailItem>
          <DetailItem label="DNI">{user.dni}</DetailItem>
          <DetailItem label="Teléfono">{user.phone}</DetailItem>
          <DetailItem label="Correo">{user.email}</DetailItem>
          <DetailItem label="Provincia">{user.province}</DetailItem>
          <DetailItem label="Localidad">{user.city}</DetailItem>
          <DetailItem label="Dirección">{user.address}</DetailItem>
        </DetailList>
      ) : user?.role === "institution" ? (
        <DetailList>
          <DetailItem label="Nombre">{user.name}</DetailItem>
          <DetailItem label="Director">{user.director}</DetailItem>
          <DetailItem label="Fecha de fundación">
            {user.foundation_date
              ? formatDate(user.foundation_date)
              : "No especificada"}
          </DetailItem>
          <DetailItem label="Teléfono">{user.phone}</DetailItem>
          <DetailItem label="Correo">{user.email}</DetailItem>
          <DetailItem label="Provincia">{user.province}</DetailItem>
          <DetailItem label="Localidad">{user.city}</DetailItem>
          <DetailItem label="Dirección">{user.address}</DetailItem>
          <DetailItem label="CBU/Alias">
            {user.bank || "No especificado"}
          </DetailItem>
          {user.lore && (
            <DetailItem label="Acerca de la institución" stacked>
              {user.lore}
            </DetailItem>
          )}
        </DetailList>
      ) : null}
    </DrawerLayout>
  );
}
