"use client";

import { Controller, useForm } from "react-hook-form";

import { ArPhoneInput } from "@/components/common/ar-phone-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeInstitutionOnboarding } from "@/actions/user/complete-onboarding";
import { DatePicker, isFutureDay } from "@/components/common/date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import {
  institutionSchema,
  type InstitutionFormSchema,
} from "@/lib/validations";

export function InstitutionForm() {
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InstitutionFormSchema>({
    resolver: zodResolver(institutionSchema),
    defaultValues: { foundation_date: "" },
  });

  async function onSubmit(data: InstitutionFormSchema) {
    const result = await completeInstitutionOnboarding(data);
    if (!result.ok) return void toast.error(result.error);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-2xl shadow-none">
      <CardHeader>
        <CardTitle>Información de la Institución</CardTitle>
        <CardDescription>
          Te pedimos algunos datos para registrarte como institución
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <Field className="col-span-2" data-invalid={!!errors.name}>
            <FieldLabel htmlFor="institution-name">Nombre de la Institución</FieldLabel>
            <Input
              id="institution-name"
              autoComplete="organization"
              aria-invalid={!!errors.name}
              {...register("name")}
              placeholder="Fundación Ayuda Social"
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field className="col-span-2" data-invalid={!!errors.director}>
            <FieldLabel htmlFor="director">Director a Cargo</FieldLabel>
            <Input
              id="director"
              autoComplete="name"
              aria-invalid={!!errors.director}
              {...register("director")}
              placeholder="Juan Pérez"
            />
            <FieldError errors={[errors.director]} />
          </Field>

          <Field className="col-span-2" data-invalid={!!errors.address}>
            <FieldLabel htmlFor="institution-address">Dirección</FieldLabel>
            <Input
              id="institution-address"
              autoComplete="street-address"
              aria-invalid={!!errors.address}
              {...register("address")}
              placeholder="Av. Principal 456"
            />
            <FieldError errors={[errors.address]} />
          </Field>

          <Field data-invalid={!!errors.province}>
            <FieldLabel htmlFor="institution-province">Provincia</FieldLabel>
            <Input
              id="institution-province"
              autoComplete="address-level1"
              aria-invalid={!!errors.province}
              {...register("province")}
              placeholder="Santa Fe"
            />
            <FieldError errors={[errors.province]} />
          </Field>

          <Field data-invalid={!!errors.city}>
            <FieldLabel htmlFor="institution-city">Ciudad</FieldLabel>
            <Input
              id="institution-city"
              autoComplete="address-level2"
              aria-invalid={!!errors.city}
              {...register("city")}
              placeholder="Rosario"
            />
            <FieldError errors={[errors.city]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="institution-phone">Teléfono</FieldLabel>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <ArPhoneInput
                  id="institution-phone"
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

          <Field data-invalid={!!errors.foundation_date}>
            <FieldLabel htmlFor="foundation-date">Fecha de Fundación</FieldLabel>
            <Controller
              control={control}
              name="foundation_date"
              render={({ field }) => (
                <DatePicker
                  id="foundation-date"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabledDays={isFutureDay}
                  captionLayout="dropdown"
                  aria-invalid={!!errors.foundation_date}
                />
              )}
            />
            <FieldError errors={[errors.foundation_date]} />
          </Field>

          <Field className="col-span-2" data-invalid={!!errors.bank}>
            <FieldLabel htmlFor="bank">CBU o Alias</FieldLabel>
            <Input id="bank" aria-invalid={!!errors.bank} {...register("bank")} />
            <FieldError errors={[errors.bank]} />
          </Field>

          <Field className="col-span-2" data-invalid={!!errors.lore}>
            <FieldLabel htmlFor="lore">Acerca de tu institución</FieldLabel>
            <Textarea
              id="lore"
              aria-invalid={!!errors.lore}
              {...register("lore")}
              placeholder="Contanos sobre la misma: A qué se dedican, cuáles son sus valores, su historia..."
              rows={5}
            />
            <FieldError errors={[errors.lore]} />
          </Field>

          <Button type="submit" className="col-span-2" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
