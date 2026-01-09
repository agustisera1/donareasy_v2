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
import Image from "next/image";
import { StatusBadge } from "./status-badge";

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
            <>
              <span className="text-sm font-medium">Monto</span>
              <span className="text-sm">
                ${selectedDonation.amount?.toLocaleString()}
              </span>

              {selectedDonation.transfer_receipt && (
                <>
                  <span className="text-sm font-medium">
                    Nombre del comprobante
                  </span>
                  <span className="text-sm">
                    {selectedDonation.transfer_receipt}
                  </span>
                </>
              )}

              {selectedDonation.receipt_url && (
                <>
                  <span className="text-sm font-medium col-span-2">
                    Adjunto
                  </span>
                  <div className="col-span-2">
                    <div className="relative w-full h-64 rounded-md overflow-hidden border">
                      <Image
                        src={selectedDonation.receipt_url}
                        alt="Comprobante de transferencia"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <span className="text-sm font-medium">Descripción</span>
              <span className="text-sm">
                {selectedDonation.type || "No especificado"}
              </span>

              {selectedDonation.receipt_url && (
                <>
                  <span className="text-sm font-medium col-span-2">
                    Adjunto
                  </span>
                  <div className="col-span-2">
                    <div className="relative w-full h-64 rounded-md overflow-hidden border">
                      <Image
                        src={selectedDonation.receipt_url}
                        alt="Imagen de la donación"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
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
            <>
              <span className="text-sm font-medium">Fecha de aceptación</span>
              <span className="text-sm">
                {formatDate(selectedDonation.date_accepted)}
              </span>
            </>
          )}

          {selectedDonation.date_cancelled && (
            <>
              <span className="text-sm font-medium">Fecha de rechazo</span>
              <span className="text-sm">
                {formatDate(selectedDonation.date_cancelled)}
              </span>
            </>
          )}

          {selectedDonation.dellivered_date && (
            <>
              <span className="text-sm font-medium">Fecha de entrega</span>
              <span className="text-sm">
                {formatDate(selectedDonation.dellivered_date)}
              </span>
            </>
          )}

          {selectedDonation.cancellation_reason && (
            <>
              <span className="text-sm font-medium">Motivo de rechazo</span>
              <span className="text-sm col-span-2">
                {selectedDonation.cancellation_reason}
              </span>
            </>
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
