"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Fragment } from "react";
import { toast } from "sonner";
import { updateDonor, updateInstitution } from "@/actions/user/update";
import { ArPhoneInput } from "@/components/common/ar-phone-input";
import { DrawerLayout } from "@/components/common/drawer-layout";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DonorData, InstitutionData } from "@/app/api/user/route";
import {
  donorEditSchema,
  institutionEditSchema,
  type DonorEditFormSchema,
  type InstitutionEditFormSchema,
} from "@/lib/validations";
import { userKeys } from "@/hooks/user-keys";
import type { ServiceResult } from "@/lib/shared/result";

type DonorEditFormData = DonorEditFormSchema;
type InstitutionEditFormData = InstitutionEditFormSchema;

interface EditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DonorData | InstitutionData | null;
}

export function EditDrawer({
  open,
  onOpenChange,
  user,
}: EditDrawerProps) {
  const isDonor = user?.role === "donor";
  const isInstitution = user?.role === "institution";
  const queryClient = useQueryClient();

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
    values: isDonor
      ? {
          name: user.name,
          lastname: user.lastname,
          dni: user.dni.toString(),
          phone: user.phone,
          address: user.address,
          province: user.province,
          city: user.city,
        }
      : undefined,
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
    values: isInstitution
      ? {
          director: user.director,
          phone: user.phone,
          address: user.address,
          province: user.province,
          city: user.city,
          bank: user.bank || "",
          lore: user.lore || "",
        }
      : undefined,
  });

  const isSubmitting = donorForm.formState.isSubmitting || institutionForm.formState.isSubmitting;

  function close() {
    donorForm.reset();
    institutionForm.reset();
    onOpenChange(false);
  }

  async function finish(result: ServiceResult<null>) {
    if (!result.ok) return void toast.error(result.error);
    await queryClient.invalidateQueries({ queryKey: userKeys.all });
    toast.success("Perfil actualizado");
    close();
  }

  const submitDonor = donorForm.handleSubmit(async (data) => finish(await updateDonor(data)));
  const submitInstitution = institutionForm.handleSubmit(async (data) => finish(await updateInstitution(data)));

  return (
    <DrawerLayout
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="Editar perfil"
      description="Editar los datos del usuario"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-profile-form"
            disabled={isSubmitting || (!isDonor && !isInstitution)}
          >
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      {isDonor ? (
        <Fragment>
          <form id="edit-profile-form" onSubmit={submitDonor} className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!donorForm.formState.errors.name}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input
                id="name"
                disabled
                aria-invalid={!!donorForm.formState.errors.name}
                {...donorForm.register("name")}
                placeholder="Nombre"
              />
              <FieldError errors={[donorForm.formState.errors.name]} />
            </Field>

            <Field data-invalid={!!donorForm.formState.errors.lastname}>
              <FieldLabel htmlFor="lastname">Apellido</FieldLabel>
              <Input
                id="lastname"
                disabled
                aria-invalid={!!donorForm.formState.errors.lastname}
                {...donorForm.register("lastname")}
                placeholder="Apellido"
              />
              <FieldError errors={[donorForm.formState.errors.lastname]} />
            </Field>

            <Field data-invalid={!!donorForm.formState.errors.dni}>
              <FieldLabel htmlFor="dni">DNI</FieldLabel>
              <Input
                disabled
                id="dni"
                type="text"
                inputMode="numeric"
                aria-invalid={!!donorForm.formState.errors.dni}
                {...donorForm.register("dni")}
                placeholder="DNI"
              />
              <FieldError errors={[donorForm.formState.errors.dni]} />
            </Field>

            <Field data-invalid={!!donorForm.formState.errors.phone}>
              <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
              <Controller
                control={donorForm.control}
                name="phone"
                render={({ field }) => (
                  <ArPhoneInput
                    id="phone"
                    autoComplete="tel"
                    aria-invalid={!!donorForm.formState.errors.phone}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError errors={[donorForm.formState.errors.phone]} />
            </Field>

            <Field data-invalid={!!donorForm.formState.errors.province}>
              <FieldLabel htmlFor="province">Provincia</FieldLabel>
              <Input
                id="province"
                aria-invalid={!!donorForm.formState.errors.province}
                {...donorForm.register("province")}
                placeholder="Provincia"
              />
              <FieldError errors={[donorForm.formState.errors.province]} />
            </Field>

            <Field data-invalid={!!donorForm.formState.errors.city}>
              <FieldLabel htmlFor="city">Localidad</FieldLabel>
              <Input
                id="city"
                aria-invalid={!!donorForm.formState.errors.city}
                {...donorForm.register("city")}
                placeholder="Ciudad"
              />
              <FieldError errors={[donorForm.formState.errors.city]} />
            </Field>

            <Field data-invalid={!!donorForm.formState.errors.address}>
              <FieldLabel htmlFor="address">Dirección</FieldLabel>
              <Input
                id="address"
                aria-invalid={!!donorForm.formState.errors.address}
                {...donorForm.register("address")}
                placeholder="Dirección"
              />
              <FieldError errors={[donorForm.formState.errors.address]} />
            </Field>
          </form>
        </Fragment>
      ) : isInstitution ? (
        <Fragment>
          <form id="edit-profile-form" onSubmit={submitInstitution} className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!institutionForm.formState.errors.director}>
              <FieldLabel htmlFor="director">Director</FieldLabel>
              <Input
                id="director"
                aria-invalid={!!institutionForm.formState.errors.director}
                {...institutionForm.register("director")}
                placeholder="Director"
              />
              <FieldError errors={[institutionForm.formState.errors.director]} />
            </Field>

            <Field data-invalid={!!institutionForm.formState.errors.bank}>
              <FieldLabel htmlFor="bank">CBU/Alias</FieldLabel>
              <Input
                id="bank"
                aria-invalid={!!institutionForm.formState.errors.bank}
                {...institutionForm.register("bank")}
                placeholder="CBU o Alias"
              />
              <FieldError errors={[institutionForm.formState.errors.bank]} />
            </Field>

            <Field data-invalid={!!institutionForm.formState.errors.phone}>
              <FieldLabel htmlFor="institution-phone">Teléfono</FieldLabel>
              <Controller
                control={institutionForm.control}
                name="phone"
                render={({ field }) => (
                  <ArPhoneInput
                    id="institution-phone"
                    autoComplete="tel"
                    aria-invalid={!!institutionForm.formState.errors.phone}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError errors={[institutionForm.formState.errors.phone]} />
            </Field>

            <Field data-invalid={!!institutionForm.formState.errors.province}>
              <FieldLabel htmlFor="province">Provincia</FieldLabel>
              <Input
                id="province"
                aria-invalid={!!institutionForm.formState.errors.province}
                {...institutionForm.register("province")}
                placeholder="Provincia"
              />
              <FieldError errors={[institutionForm.formState.errors.province]} />
            </Field>

            <Field data-invalid={!!institutionForm.formState.errors.city}>
              <FieldLabel htmlFor="city">Localidad</FieldLabel>
              <Input
                id="city"
                aria-invalid={!!institutionForm.formState.errors.city}
                {...institutionForm.register("city")}
                placeholder="Ciudad"
              />
              <FieldError errors={[institutionForm.formState.errors.city]} />
            </Field>

            <Field data-invalid={!!institutionForm.formState.errors.address}>
              <FieldLabel htmlFor="address">Dirección</FieldLabel>
              <Input
                id="address"
                aria-invalid={!!institutionForm.formState.errors.address}
                {...institutionForm.register("address")}
                placeholder="Dirección"
              />
              <FieldError errors={[institutionForm.formState.errors.address]} />
            </Field>

            <Field className="col-span-2" data-invalid={!!institutionForm.formState.errors.lore}>
              <FieldLabel htmlFor="lore">Acerca de la institución</FieldLabel>
              <Textarea
                id="lore"
                aria-invalid={!!institutionForm.formState.errors.lore}
                {...institutionForm.register("lore")}
                placeholder="Descripción de la institución..."
                rows={4}
              />
              <FieldError errors={[institutionForm.formState.errors.lore]} />
            </Field>
          </form>
        </Fragment>
      ) : null}
    </DrawerLayout>
  );
}
