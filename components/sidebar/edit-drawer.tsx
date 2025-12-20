"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
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
import { toast } from "sonner";

// Schema para donor - usando los mismos validadores que el formulario de onboarding
const donorEditSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  lastname: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(100, "El apellido no puede exceder 100 caracteres"),
  dni: z
    .string()
    .min(1, "El DNI es requerido")
    .regex(/^\d+$/, "El DNI solo puede contener números")
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return num >= 1000000 && num <= 99999999;
      },
      {
        message: "El DNI debe tener entre 7 y 8 dígitos",
      }
    ),
  phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 caracteres")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(
      /^[\d\s\+\-\(\)]+$/,
      "El teléfono solo puede contener números, espacios, +, - y paréntesis"
    ),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  province: z
    .string()
    .min(2, "La provincia es requerida")
    .max(100, "La provincia no puede exceder 100 caracteres"),
  city: z
    .string()
    .min(2, "La ciudad es requerida")
    .max(100, "La ciudad no puede exceder 100 caracteres"),
});

// Schema para institution - usando los mismos validadores que el formulario de onboarding
const institutionEditSchema = z.object({
  director: z
    .string()
    .min(2, "El nombre del director debe tener al menos 2 caracteres")
    .max(100, "El nombre del director no puede exceder 100 caracteres"),
  phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 caracteres")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(
      /^[\d\s\+\-\(\)]+$/,
      "El teléfono solo puede contener números, espacios, +, - y paréntesis"
    ),
  address: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  province: z
    .string()
    .min(2, "La provincia es requerida")
    .max(100, "La provincia no puede exceder 100 caracteres"),
  city: z
    .string()
    .min(2, "La ciudad es requerida")
    .max(100, "La ciudad no puede exceder 100 caracteres"),
  bank: z
    .string()
    .min(1, "El CBU o alias es requerido")
    .max(50, "El CBU o alias no puede exceder 50 caracteres")
    .refine(
      (val) => {
        // CBU: exactamente 22 dígitos
        if (/^\d{22}$/.test(val)) {
          return true;
        }
        // Alias: 6-20 caracteres, puede contener letras, números y puntos
        if (
          /^[A-Za-z0-9.]+$/.test(val) &&
          val.length >= 6 &&
          val.length <= 20
        ) {
          return true;
        }
        return false;
      },
      {
        message:
          "Debe ser un CBU (22 dígitos) o un alias bancario (6-20 caracteres, letras, números y puntos)",
      }
    ),
  lore: z.string().max(2000, "La descripción no puede exceder 2000 caracteres"),
});

type DonorEditFormData = z.infer<typeof donorEditSchema>;
type InstitutionEditFormData = z.infer<typeof institutionEditSchema>;

interface EditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DonorData | InstitutionData | null;
}

export function EditDrawer({ open, onOpenChange, user }: EditDrawerProps) {
  const isDonor = user?.role === "donor";
  const isInstitution = user?.role === "institution";

  // Form para donor
  const donorForm = useForm<DonorEditFormData>({
    resolver: zodResolver(donorEditSchema),
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

  const onSubmit = (data: DonorEditFormData | InstitutionEditFormData) => {
    console.log("form submitted", data);
    toast("Datos actualizados!", {
      description: "Los cambios se han guardado correctamente.",
    });
    onOpenChange(false);
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader aria-describedby={undefined} className="border-b">
          <DrawerTitle>Editar perfil</DrawerTitle>
          <DrawerDescription>Editar los datos del Usuario</DrawerDescription>
        </DrawerHeader>

        {isDonor ? (
          <>
            <form className="grid grid-cols-2 gap-4 p-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
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
              >
                Guardar Cambios
              </Button>
            </DrawerFooter>
          </>
        ) : isInstitution ? (
          <>
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
              >
                Guardar Cambios
              </Button>
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
