"use client";

import { CalendarClock, ImageIcon, Package, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/common/detail-card";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { ImagePreview } from "@/components/common/image-preview";
import { StatCard } from "@/components/common/stat-card";
import { categoryTranslations } from "@/lib/constants";
import type { DonationWithRelations } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CategoryBadge } from "./category-badge";
import { DeliveryMethodBadge } from "./delivery-method-badge";
import { StatusBadge } from "./status-badge";

interface ViewDonationDrawerProps {
  donation: DonationWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewDonationDrawer({ donation, open, onOpenChange }: ViewDonationDrawerProps) {
  const isMoney = donation.amount !== null;
  const hasTracking = Boolean(
    donation.date_accepted || donation.date_cancelled || donation.dellivered_date || donation.cancellation_reason,
  );

  return (
    <DrawerLayout
      open={open}
      onOpenChange={onOpenChange}
      title={isMoney ? "Donación monetaria" : donation.name || "Bienes"}
      description="Información registrada de la donación"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
      wide
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {isMoney ? (
            <StatCard size="sm" label="Monto" value={formatCurrency(donation.amount ?? 0)} />
          ) : (
            <StatCard size="sm" label="Categoría" value={categoryTranslations[donation.category].label} />
          )}
          <StatCard size="sm" label="Creada" value={formatDate(donation.date_created, "short")} />
          <StatCard size="sm" label="Campaña" value={donation.campaign?.type ?? "Sin campaña"} />
        </div>
        <div className="grid gap-3">
          <DetailCard title="Detalle" icon={<Package />}>
            <DetailList>
              <DetailItem label="Estado">
                <StatusBadge status={donation.status} />
              </DetailItem>
              <DetailItem label="Categoría">
                <CategoryBadge category={donation.category} />
              </DetailItem>
              <DetailItem label="Entrega">
                <DeliveryMethodBadge deliveryMethod={donation.delivery_method} />
              </DetailItem>
              {isMoney && donation.attachment_name && (
                <DetailItem label="Comprobante">{donation.attachment_name}</DetailItem>
              )}
              {!isMoney && donation.description && (
                <DetailItem label="Descripción" stacked>
                  {donation.description}
                </DetailItem>
              )}
            </DetailList>
          </DetailCard>
          {donation.donor && (
            <DetailCard title="Donante" icon={<User />}>
              <DetailList>
                <DetailItem label="Nombre">
                  {donation.donor.name} {donation.donor.lastname}
                </DetailItem>
                <DetailItem label="Teléfono">{donation.donor.phone}</DetailItem>
              </DetailList>
            </DetailCard>
          )}
          {hasTracking && (
            <DetailCard title="Seguimiento" icon={<CalendarClock />}>
              <DetailList>
                {donation.date_accepted && (
                  <DetailItem label="Aceptada">{formatDate(donation.date_accepted, "short")}</DetailItem>
                )}
                {donation.date_cancelled && (
                  <DetailItem label="Rechazada">{formatDate(donation.date_cancelled, "short")}</DetailItem>
                )}
                {donation.dellivered_date && (
                  <DetailItem label="Entregada">{formatDate(donation.dellivered_date, "short")}</DetailItem>
                )}
                {donation.cancellation_reason && (
                  <DetailItem label="Motivo de rechazo" stacked>
                    {donation.cancellation_reason}
                  </DetailItem>
                )}
              </DetailList>
            </DetailCard>
          )}
        </div>
        {donation.attachment_url && (
          <DetailCard title={isMoney ? "Comprobante de transferencia" : "Imagen adjunta"} icon={<ImageIcon />}>
            <ImagePreview
              src={donation.attachment_url}
              alt={isMoney ? "Comprobante de transferencia" : "Imagen de la donación"}
            />
          </DetailCard>
        )}
      </div>
    </DrawerLayout>
  );
}
