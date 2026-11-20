"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeDonorOnboarding } from "@/actions/user/complete-onboarding";
import { ArPhoneInput } from "@/components/common/ar-phone-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { donorSchema, type DonorFormSchema } from "@/lib/validations";

export function DonorForm() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DonorFormSchema>({
    resolver: zodResolver(donorSchema),
  });

  async function onSubmit(data: DonorFormSchema) {
    const result = await completeDonorOnboarding(data);
    if (!result.ok) return void toast.error(result.error);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-2xl shadow-none">
      <CardHeader>
        <CardTitle>Información de Donante</CardTitle>
        <CardDescription>
          Te pedimos algunos datos para registrarte como donante
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Nombre</FieldLabel>
            <Input
              id="name"
              autoComplete="given-name"
              aria-invalid={!!errors.name}
              {...register("name")}
              placeholder="Juan"
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.lastname}>
            <FieldLabel htmlFor="lastname">Apellido</FieldLabel>
            <Input
              id="lastname"
              autoComplete="family-name"
              aria-invalid={!!errors.lastname}
              {...register("lastname")}
              placeholder="Pérez"
            />
            <FieldError errors={[errors.lastname]} />
          </Field>

          <Field className="col-span-2" data-invalid={!!errors.dni}>
            <FieldLabel htmlFor="dni">DNI</FieldLabel>
            <Input
              id="dni"
              inputMode="numeric"
              maxLength={8}
              aria-invalid={!!errors.dni}
              {...register("dni")}
              placeholder="12345678"
            />
            <FieldError errors={[errors.dni]} />
          </Field>

          <Field className="col-span-2" data-invalid={!!errors.address}>
            <FieldLabel htmlFor="address">Dirección</FieldLabel>
            <Input
              id="address"
              autoComplete="street-address"
              aria-invalid={!!errors.address}
              {...register("address")}
              placeholder="Zeballos 1342"
            />
            <FieldError errors={[errors.address]} />
          </Field>

          <Field data-invalid={!!errors.province}>
            <FieldLabel htmlFor="province">Provincia</FieldLabel>
            <Input
              id="province"
              autoComplete="address-level1"
              aria-invalid={!!errors.province}
              {...register("province")}
              placeholder="Santa Fe"
            />
            <FieldError errors={[errors.province]} />
          </Field>

          <Field data-invalid={!!errors.city}>
            <FieldLabel htmlFor="city">Ciudad</FieldLabel>
            <Input
              id="city"
              autoComplete="address-level2"
              aria-invalid={!!errors.city}
              {...register("city")}
              placeholder="Rosario"
            />
            <FieldError errors={[errors.city]} />
          </Field>

          <Field className="col-span-2" data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <ArPhoneInput
                  id="phone"
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <FieldError errors={[errors.phone]} />
          </Field>

          <Button type="submit" className="col-span-2" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
