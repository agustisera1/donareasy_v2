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
import { Fragment } from "react";
import { ImagePreview } from "./image-preview";

export function ViewDonationDrawer() {
  const { viewDrawerOpen, closeViewDrawer, selectedDonation } =
    useDonationsContext();

  if (!selectedDonation) {
    return null;
  }

  const isMoney = selectedDonation.amount !== null;

  return (
    <Drawer
      direction="right"
      open={viewDrawerOpen}
      onOpenChange={closeViewDrawer}
    >
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
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

              {selectedDonation.transfer_receipt && (
                <Fragment>
                  <span className="text-sm font-medium">
                    Nombre del comprobante
                  </span>
                  <span className="text-sm">
                    {selectedDonation.transfer_receipt}
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
                    />
                  </div>
                </Fragment>
              )}
            </Fragment>
          ) : (
            <Fragment>
              <span className="text-sm font-medium">Descripción</span>
              <span className="text-sm">
                {selectedDonation.type || "No especificado"}
              </span>

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

        <DrawerFooter className="border-t">
          <Button className="w-1/2 mx-auto" onClick={closeViewDrawer}>
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
