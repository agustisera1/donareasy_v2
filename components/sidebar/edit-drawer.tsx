"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, Fragment } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DonorData, InstitutionData } from "@/app/api/user/route";
import {
  donorEditSchema,
  institutionEditSchema,
  type DonorEditFormSchema,
  type InstitutionEditFormSchema,
} from "@/lib/validations";
import { useUpdateUser } from "@/hooks/use-update-user";

type DonorEditFormData = DonorEditFormSchema;
type InstitutionEditFormData = InstitutionEditFormSchema;

interface EditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DonorData | InstitutionData | null;
  onUpdateSuccess?: () => void; // Callback opcional para refrescar datos después de actualizar
}

export function EditDrawer({
  open,
  onOpenChange,
  user,
  onUpdateSuccess,
}: EditDrawerProps) {
  const isDonor = user?.role === "donor";
  const isInstitution = user?.role === "institution";
  const { updateUser, isLoading } = useUpdateUser();

  // Form para donor
  const donorForm = useForm<DonorEditFormData>({
    resolver: zodResolver(donorEditSchema),
    mode: "onChange", // Validar en tiempo real
    defaultValues: {
      name: "",
      lastname: "",
      dni: "",
      phone: "",
      address: "",
      province: "",
      city: "",
    },
  });

  // Form para institution
  const institutionForm = useForm<InstitutionEditFormData>({
    resolver: zodResolver(institutionEditSchema),
    mode: "onChange", // Validar en tiempo real
    defaultValues: {
      director: "",
      phone: "",
      address: "",
      province: "",
      city: "",
      bank: "",
      lore: "",
    },
  });

  // Actualizar valores del formulario cuando se abre el drawer o cuando cambian los datos del usuario
  useEffect(() => {
    if (!open || !user) return;

    if (isDonor) {
      donorForm.reset({
        name: user.name,
        lastname: user.lastname,
        dni: user.dni.toString(),
        phone: user.phone,
        address: user.address,
        province: user.province,
        city: user.city,
      });
    } else if (isInstitution) {
      institutionForm.reset({
        director: user.director,
        phone: user.phone,
        address: user.address,
        province: user.province,
        city: user.city,
        bank: user.bank || "",
        lore: user.lore || "",
      });
    }
  }, [open, user, isDonor, isInstitution, donorForm, institutionForm]);

  const onSubmit = async (
    data: DonorEditFormData | InstitutionEditFormData
  ) => {
    const success = await updateUser(data, user);
    if (success) {
      onOpenChange(false);
      onUpdateSuccess?.(); // Refrescar datos después de actualizar exitosamente
    }
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
          <DrawerTitle>Editar perfil</DrawerTitle>
          <DrawerDescription>Editar los datos del Usuario</DrawerDescription>
        </DrawerHeader>

        {isDonor ? (
          <Fragment>
            <form className="grid grid-cols-2 gap-4 p-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  disabled
                  {...donorForm.register("name")}
                  placeholder="Nombre"
                />
                {donorForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {donorForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastname">Apellido</Label>
                <Input
                  id="lastname"
                  disabled
                  {...donorForm.register("lastname")}
                  placeholder="Apellido"
                />
                {donorForm.formState.errors.lastname && (
                  <p className="text-sm text-red-500">
                    {donorForm.formState.errors.lastname.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  disabled
                  id="dni"
                  type="text"
                  inputMode="numeric"
                  {...donorForm.register("dni")}
                  placeholder="DNI"
                />
                {donorForm.formState.errors.dni && (
                  <p className="text-sm text-red-500">
                    {donorForm.formState.errors.dni.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  {...donorForm.register("phone")}
                  placeholder="Teléfono"
                />
                {donorForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">
                    {donorForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  {...donorForm.register("province")}
                  placeholder="Provincia"
                />
                {donorForm.formState.errors.province && (
                  <p className="text-sm text-red-500">
                    {donorForm.formState.errors.province.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">Localidad</Label>
                <Input
                  id="city"
                  {...donorForm.register("city")}
                  placeholder="Ciudad"
                />
                {donorForm.formState.errors.city && (
                  <p className="text-sm text-red-500">
                    {donorForm.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  {...donorForm.register("address")}
                  placeholder="Dirección"
                />
                {donorForm.formState.errors.address && (
                  <p className="text-sm text-red-500">
                    {donorForm.formState.errors.address.message}
                  </p>
                )}
              </div>
            </form>

            <DrawerFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={donorForm.handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? "Actualizando..." : "Guardar Cambios"}
              </Button>
            </DrawerFooter>
          </Fragment>
        ) : isInstitution ? (
          <Fragment>
            <form className="grid grid-cols-2 gap-4 p-4">
              <div className="grid gap-2">
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  {...institutionForm.register("director")}
                  placeholder="Director"
                />
                {institutionForm.formState.errors.director && (
                  <p className="text-sm text-red-500">
                    {institutionForm.formState.errors.director.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bank">CBU/Alias</Label>
                <Input
                  id="bank"
                  {...institutionForm.register("bank")}
                  placeholder="CBU o Alias"
                />
                {institutionForm.formState.errors.bank && (
                  <p className="text-sm text-red-500">
                    {institutionForm.formState.errors.bank.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  {...institutionForm.register("phone")}
                  placeholder="Teléfono"
                />
                {institutionForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">
                    {institutionForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  {...institutionForm.register("province")}
                  placeholder="Provincia"
                />
                {institutionForm.formState.errors.province && (
                  <p className="text-sm text-red-500">
                    {institutionForm.formState.errors.province.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="city">Localidad</Label>
                <Input
                  id="city"
                  {...institutionForm.register("city")}
                  placeholder="Ciudad"
                />
                {institutionForm.formState.errors.city && (
                  <p className="text-sm text-red-500">
                    {institutionForm.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  {...institutionForm.register("address")}
                  placeholder="Dirección"
                />
                {institutionForm.formState.errors.address && (
                  <p className="text-sm text-red-500">
                    {institutionForm.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2 col-span-2">
                <Label htmlFor="lore">Acerca de la institución</Label>
                <Textarea
                  id="lore"
                  {...institutionForm.register("lore")}
                  placeholder="Descripción de la institución..."
                  rows={4}
                />
                {institutionForm.formState.errors.lore && (
                  <p className="text-sm text-red-500">
                    {institutionForm.formState.errors.lore.message}
                  </p>
                )}
              </div>
            </form>

            <DrawerFooter className="border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={institutionForm.handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DrawerFooter>
          </Fragment>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
