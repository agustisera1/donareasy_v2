"use client";

import { BookOpen, Landmark, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/common/detail-card";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { StatCard } from "@/components/common/stat-card";
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
      title={institution.name}
      description="Información registrada de la institución"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
      wide
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard size="sm" label="Ubicación" value={institution.city} hint={institution.province} />
          <StatCard size="sm" label="Fundación" value={formatDate(institution.foundation_date, "short")} />
          <StatCard size="sm" label="Director a cargo" value={institution.director} />
        </div>
        <div className="grid gap-3">
          <DetailCard title="Contacto" icon={<Phone />}>
            <DetailList>
              <DetailItem label="Dirección">{institution.address}</DetailItem>
              <DetailItem label="Teléfono">{institution.phone}</DetailItem>
            </DetailList>
          </DetailCard>
          <DetailCard title="Donaciones de dinero" icon={<Landmark />}>
            {institution.bank ? (
              <DetailList>
                <DetailItem label="Alias | CBU">{institution.bank}</DetailItem>
              </DetailList>
            ) : (
              <p className="text-muted-foreground">La institución no registró un alias o CBU.</p>
            )}
          </DetailCard>
        </div>
        {institution.lore && (
          <DetailCard title="Historia" icon={<BookOpen />}>
            <p className="whitespace-pre-line text-muted-foreground">{institution.lore}</p>
          </DetailCard>
        )}
      </div>
    </DrawerLayout>
  );
}
