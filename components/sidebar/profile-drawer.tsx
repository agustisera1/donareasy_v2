"use client";

import { BookOpen, Home, Landmark, Phone, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/common/detail-card";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { StatCard } from "@/components/common/stat-card";
import { DonorData, InstitutionData } from "@/app/api/user/route";
import { formatDate } from "@/lib/utils";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DonorData | InstitutionData | null;
}

export function ProfileDrawer({ open, onOpenChange, user }: ProfileDrawerProps) {
  return (
    <DrawerLayout
      open={open}
      onOpenChange={onOpenChange}
      title="Cuenta"
      description="Datos del usuario"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
      wide
    >
      {user?.role === "donor" ? (
        <div className="grid gap-3">
          <DetailCard title="Datos personales" icon={<User />}>
            <DetailList>
              <DetailItem label="Nombre">
                {user.name} {user.lastname}
              </DetailItem>
              <DetailItem label="DNI">{user.dni}</DetailItem>
            </DetailList>
          </DetailCard>
          <DetailCard title="Contacto" icon={<Phone />}>
            <DetailList>
              <DetailItem label="Teléfono">{user.phone}</DetailItem>
              <DetailItem label="Correo">{user.email}</DetailItem>
            </DetailList>
          </DetailCard>
          <DetailCard title="Domicilio" icon={<Home />}>
            <DetailList>
              <DetailItem label="Dirección">{user.address}</DetailItem>
              <DetailItem label="Localidad">{user.city}</DetailItem>
              <DetailItem label="Provincia">{user.province}</DetailItem>
            </DetailList>
          </DetailCard>
        </div>
      ) : user?.role === "institution" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard size="sm" label="Ubicación" value={user.city} hint={user.province} />
            <StatCard
              size="sm"
              label="Fundación"
              value={user.foundation_date ? formatDate(user.foundation_date, "short") : "No especificada"}
            />
            <StatCard size="sm" label="Director a cargo" value={user.director} />
          </div>
          <div className="grid gap-3">
            <DetailCard title="Contacto" icon={<Phone />}>
              <DetailList>
                <DetailItem label="Nombre">{user.name}</DetailItem>
                <DetailItem label="Dirección">{user.address}</DetailItem>
                <DetailItem label="Teléfono">{user.phone}</DetailItem>
                <DetailItem label="Correo">{user.email}</DetailItem>
              </DetailList>
            </DetailCard>
            <DetailCard title="Donaciones de dinero" icon={<Landmark />}>
              {user.bank ? (
                <DetailList>
                  <DetailItem label="Alias | CBU">{user.bank}</DetailItem>
                </DetailList>
              ) : (
                <p className="text-muted-foreground">Todavía no registraste un alias o CBU.</p>
              )}
            </DetailCard>
          </div>
          {user.lore && (
            <DetailCard title="Acerca de la institución" icon={<BookOpen />}>
              <p className="whitespace-pre-line text-muted-foreground">{user.lore}</p>
            </DetailCard>
          )}
        </div>
      ) : null}
    </DrawerLayout>
  );
}
