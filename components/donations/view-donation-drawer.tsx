"use client";

import { Button } from "@/components/ui/button";
import { DetailItem, DetailList } from "@/components/common/detail-list";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { useDonationsContext } from "@/contexts/donations-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { CategoryBadge } from "./category-badge";
import { DeliveryMethodBadge } from "./delivery-method-badge";
import { ImagePreview } from "./image-preview";

export function ViewDonationDrawer() {
  const { viewDrawerOpen, closeViewDrawer, selectedDonation } =
    useDonationsContext();

  if (!selectedDonation) return null;

  const isMoney = selectedDonation.amount !== null;

  return (
    <DrawerLayout
      open={viewDrawerOpen}
      onOpenChange={closeViewDrawer}
      title="Detalles de la donación"
      description="Información registrada de la donación"
      footer={<Button onClick={closeViewDrawer}>Cerrar</Button>}
    >
      <DetailList>
        {isMoney ? (
          <>
            <DetailItem label="Monto">
              <span className="tabular-nums">
                {formatCurrency(selectedDonation.amount ?? 0)}
              </span>
            </DetailItem>
            {selectedDonation.attachment_name && (
              <DetailItem label="Nombre del comprobante">
                {selectedDonation.attachment_name}
              </DetailItem>
            )}
          </>
        ) : (
          <>
            {selectedDonation.name && (
              <DetailItem label="Nombre">{selectedDonation.name}</DetailItem>
            )}
            {selectedDonation.description && (
              <DetailItem label="Descripción">
                {selectedDonation.description}
              </DetailItem>
            )}
          </>
        )}

        {selectedDonation.attachment_url && (
          <DetailItem label="Imagen adjunta" stacked>
            <ImagePreview
              src={selectedDonation.attachment_url}
              alt={
                isMoney ? "Comprobante de transferencia" : "Imagen de la donación"
              }
            />
          </DetailItem>
        )}

        <DetailItem label="Estado">
          <StatusBadge status={selectedDonation.status} />
        </DetailItem>
        <DetailItem label="Categoría">
          <CategoryBadge category={selectedDonation.category} />
        </DetailItem>
        <DetailItem label="Forma de entrega">
          <DeliveryMethodBadge
            deliveryMethod={selectedDonation.delivery_method}
          />
        </DetailItem>
        {selectedDonation.campaign && (
          <DetailItem label="Campaña">{selectedDonation.campaign.type}</DetailItem>
        )}
        <DetailItem label="Donante">{selectedDonation.donor}</DetailItem>
        <DetailItem label="Contacto">{selectedDonation.donor_phone}</DetailItem>
        <DetailItem label="Fecha de creación">
          {formatDate(selectedDonation.date_created)}
        </DetailItem>
        {selectedDonation.date_accepted && (
          <DetailItem label="Fecha de aceptación">
            {formatDate(selectedDonation.date_accepted)}
          </DetailItem>
        )}
        {selectedDonation.date_cancelled && (
          <DetailItem label="Fecha de rechazo">
            {formatDate(selectedDonation.date_cancelled)}
          </DetailItem>
        )}
        {selectedDonation.dellivered_date && (
          <DetailItem label="Fecha de entrega">
            {formatDate(selectedDonation.dellivered_date)}
          </DetailItem>
        )}
        {selectedDonation.cancellation_reason && (
          <DetailItem label="Motivo de rechazo" stacked>
            {selectedDonation.cancellation_reason}
          </DetailItem>
        )}
      </DetailList>
    </DrawerLayout>
  );
}
