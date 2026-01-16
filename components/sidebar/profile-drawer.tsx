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
import { DonorData, InstitutionData } from "@/app/api/user/route";
import { Fragment } from "react";

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
  const isDonor = user?.role === "donor";
  const isInstitution = user?.role === "institution";

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
          <DrawerTitle>Cuenta</DrawerTitle>
          <DrawerDescription>Datos del Usuario</DrawerDescription>
        </DrawerHeader>

        <div className="grid grid-cols-2 gap-4 p-4">
          {isDonor ? (
            <Fragment>
              <span className="text-sm font-medium">Nombre</span>
              <span className="text-sm">{user?.name}</span>

              <span className="text-sm font-medium">Apellido</span>
              <span className="text-sm">{user.lastname}</span>

              <span className="text-sm font-medium">DNI</span>
              <span className="text-sm">{user.dni}</span>

              <span className="text-sm font-medium">Teléfono</span>
              <span className="text-sm">{user?.phone}</span>

              <span className="text-sm font-medium">Correo</span>
              <span className="text-sm">{user?.email}</span>

              <span className="text-sm font-medium">Provincia</span>
              <span className="text-sm">{user?.province}</span>

              <span className="text-sm font-medium">Localidad</span>
              <span className="text-sm">{user?.city}</span>

              <span className="text-sm font-medium">Dirección</span>
              <span className="text-sm">{user?.address}</span>
            </Fragment>
          ) : isInstitution ? (
            <Fragment>
              <span className="text-sm font-medium">Nombre</span>
              <span className="text-sm">{user?.name}</span>

              <span className="text-sm font-medium">Director</span>
              <span className="text-sm">{user.director}</span>

              <span className="text-sm font-medium">Fecha de Fundación</span>
              <span className="text-sm">
                {user.foundation_date
                  ? new Date(user.foundation_date).toLocaleDateString("es-AR")
                  : "No especificada"}
              </span>

              <span className="text-sm font-medium">Teléfono</span>
              <span className="text-sm">{user?.phone}</span>

              <span className="text-sm font-medium">Correo</span>
              <span className="text-sm">{user?.email}</span>

              <span className="text-sm font-medium">Provincia</span>
              <span className="text-sm">{user?.province}</span>

              <span className="text-sm font-medium">Localidad</span>
              <span className="text-sm">{user?.city}</span>

              <span className="text-sm font-medium">Dirección</span>
              <span className="text-sm">{user?.address}</span>

              <span className="text-sm font-medium">CBU/Alias</span>
              <span className="text-sm">{user.bank || "No especificado"}</span>

              {user.lore && (
                <Fragment>
                  <span className="text-sm font-medium">
                    Acerca de la institución
                  </span>
                  <span className="text-sm col-span-2">{user.lore}</span>
                </Fragment>
              )}
            </Fragment>
          ) : null}
        </div>

        <DrawerFooter className="border-t">
          <Button className="w-1/2 mx-auto" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
