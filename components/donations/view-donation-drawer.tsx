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
import { useDonationsContext } from "@/contexts/donations-context";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
import { CategoryBadge } from "./category-badge";
import { DeliveryMethodBadge } from "./delivery-method-badge";
import { Fragment } from "react";
import { ImagePreview } from "./image-preview";

export function ViewDonationDrawer() {
  const { viewDrawerOpen, closeViewDrawer, selectedDonation } =
    useDonationsContext();

  if (!selectedDonation) return null;

  const isMoney = selectedDonation.amount !== null;

  return (
    <Drawer
      direction="right"
      open={viewDrawerOpen}
      onOpenChange={closeViewDrawer}
    >
      <DrawerContent className="overflow-y-auto overflow-x-hidden">
        <DrawerHeader
          aria-describedby={undefined}
          className="border-b sticky top-0 bg-background"
        >
          <DrawerTitle>Detalles de la donación</DrawerTitle>
          <DrawerDescription>
            Información registrada de la donación
          </DrawerDescription>
        </DrawerHeader>

        <div className="grid grid-cols-2 gap-4 p-4">
          {isMoney ? (
            <Fragment>
              <span className="text-sm font-medium">Monto</span>
              <span className="text-sm">
                ${selectedDonation.amount?.toLocaleString()}
              </span>

              {selectedDonation.attachment_name && (
                <Fragment>
                  <span className="text-sm font-medium">
                    Nombre del comprobante
                  </span>
                  <span className="text-sm">
                    {selectedDonation.attachment_name}
                  </span>
                </Fragment>
              )}

              {selectedDonation.attachment_url && (
                <Fragment>
                  <span className="text-sm font-medium col-span-2">
                    Imagen adjunta
                  </span>
                  <div className="col-span-2">
                    <ImagePreview
                      src={selectedDonation.attachment_url}
                      alt="Comprobante de transferencia"
                      blur={false}
                    />
                  </div>
                </Fragment>
              )}
            </Fragment>
          ) : (
            <Fragment>
              {selectedDonation.name && (
                <Fragment>
                  <span className="text-sm font-medium">Nombre</span>
                  <span className="text-sm">{selectedDonation.name}</span>
                </Fragment>
              )}

              {selectedDonation.description && (
                <Fragment>
                  <span className="text-sm font-medium">Descripción</span>
                  <span className="text-sm">
                    {selectedDonation.description}
                  </span>
                </Fragment>
              )}

              {selectedDonation.attachment_url && (
                <Fragment>
                  <span className="text-sm font-medium col-span-2">
                    Imagen adjunta
                  </span>
                  <div className="col-span-2">
                    <ImagePreview
                      src={selectedDonation.attachment_url}
                      alt="Imagen de la donación"
                    />
                  </div>
                </Fragment>
              )}
            </Fragment>
          )}

          <span className="text-sm font-medium">Estado</span>
          <span className="text-sm">
            <StatusBadge status={selectedDonation.status} />
          </span>

          <span className="text-sm font-medium">Categoría</span>
          <span className="text-sm">
            <CategoryBadge category={selectedDonation.category} />
          </span>

          <span className="text-sm font-medium">Forma de entrega</span>
          <span className="text-sm">
            <DeliveryMethodBadge
              deliveryMethod={selectedDonation.delivery_method}
            />
          </span>

          <span className="text-sm font-medium">Donante</span>
          <span className="text-sm">{selectedDonation.donor}</span>

          <span className="text-sm font-medium">Contacto</span>
          <span className="text-sm">{selectedDonation.donor_phone}</span>

          <span className="text-sm font-medium">Fecha de creación</span>
          <span className="text-sm">
            {formatDate(selectedDonation.date_created)}
          </span>

          {selectedDonation.date_accepted && (
            <Fragment>
              <span className="text-sm font-medium">Fecha de aceptación</span>
              <span className="text-sm">
                {formatDate(selectedDonation.date_accepted)}
              </span>
            </Fragment>
          )}

          {selectedDonation.date_cancelled && (
            <Fragment>
              <span className="text-sm font-medium">Fecha de rechazo</span>
              <span className="text-sm">
                {formatDate(selectedDonation.date_cancelled)}
              </span>
            </Fragment>
          )}

          {selectedDonation.dellivered_date && (
            <Fragment>
              <span className="text-sm font-medium">Fecha de entrega</span>
              <span className="text-sm">
                {formatDate(selectedDonation.dellivered_date)}
              </span>
            </Fragment>
          )}

          {selectedDonation.cancellation_reason && (
            <Fragment>
              <span className="text-sm font-medium">Motivo de rechazo</span>
              <span className="text-sm col-span-2">
                {selectedDonation.cancellation_reason}
              </span>
            </Fragment>
          )}
        </div>

        <DrawerFooter className="border-t sticky bottom-0 bg-background">
          <Button className="w-1/2 mx-auto" onClick={closeViewDrawer}>
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
