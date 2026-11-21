"use client";

import { Button } from "@/components/ui/button";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { ImagePreview } from "@/components/common/image-preview";
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

  return (
    <DrawerLayout
      open={open}
      onOpenChange={onOpenChange}
      title="Detalles de la donación"
      description="Información registrada de la donación"
      footer={<Button onClick={() => onOpenChange(false)}>Cerrar</Button>}
    >
      <DetailList>
        {isMoney ? (
          <>
            <DetailItem label="Monto">
              <span className="tabular-nums">{formatCurrency(donation.amount ?? 0)}</span>
            </DetailItem>
            {donation.attachment_name && (
              <DetailItem label="Nombre del comprobante">{donation.attachment_name}</DetailItem>
            )}
          </>
        ) : (
          <>
            {donation.name && <DetailItem label="Nombre">{donation.name}</DetailItem>}
            {donation.description && (
              <DetailItem label="Descripción">{donation.description}</DetailItem>
            )}
          </>
        )}

        {donation.attachment_url && (
          <DetailItem label="Imagen adjunta" stacked>
            <ImagePreview
              src={donation.attachment_url}
              alt={isMoney ? "Comprobante de transferencia" : "Imagen de la donación"}
            />
          </DetailItem>
        )}

        <DetailItem label="Estado">
          <StatusBadge status={donation.status} />
        </DetailItem>
        <DetailItem label="Categoría">
          <CategoryBadge category={donation.category} />
        </DetailItem>
        <DetailItem label="Forma de entrega">
          <DeliveryMethodBadge deliveryMethod={donation.delivery_method} />
        </DetailItem>
        {donation.campaign && <DetailItem label="Campaña">{donation.campaign.type}</DetailItem>}
        {donation.donor && (
          <>
            <DetailItem label="Donante">
              {donation.donor.name} {donation.donor.lastname}
            </DetailItem>
            <DetailItem label="Contacto">{donation.donor.phone}</DetailItem>
          </>
        )}
        <DetailItem label="Fecha de creación">{formatDate(donation.date_created)}</DetailItem>
        {donation.date_accepted && (
          <DetailItem label="Fecha de aceptación">{formatDate(donation.date_accepted)}</DetailItem>
        )}
        {donation.date_cancelled && (
          <DetailItem label="Fecha de rechazo">{formatDate(donation.date_cancelled)}</DetailItem>
        )}
        {donation.dellivered_date && (
          <DetailItem label="Fecha de entrega">{formatDate(donation.dellivered_date)}</DetailItem>
        )}
        {donation.cancellation_reason && (
          <DetailItem label="Motivo de rechazo" stacked>
            {donation.cancellation_reason}
          </DetailItem>
        )}
      </DetailList>
    </DrawerLayout>
  );
}
