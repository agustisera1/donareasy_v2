"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ArPhoneInput } from "@/components/common/ar-phone-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestGuestAccess } from "@/actions/donations/request-guest-access";
import { guestAccessSchema, type GuestAccessFormSchema } from "@/lib/validations";

export function GuestAccessForm() {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<GuestAccessFormSchema>({
    resolver: zodResolver(guestAccessSchema),
    defaultValues: { name: "", lastname: "", email: "", phone: "" },
  });

  // setError dentro del submit deja isSubmitSuccessful en false: el form sigue visible.
  async function onSubmit(data: GuestAccessFormSchema) {
    const result = await requestGuestAccess(data);
    if (!result.ok) setError("root.server", { message: result.error });
  }

  if (isSubmitSuccessful) {
    return (
      <div className="space-y-2 rounded-lg border bg-muted/40 p-6 text-center">
        <p className="text-lg font-semibold">¡Revisá tu correo!</p>
        <p className="text-sm text-muted-foreground">
          Te enviamos un enlace para hacer tu donación. Tenés <strong>30 minutos</strong> para usarlo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <fieldset disabled={isSubmitting} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Nombre</FieldLabel>
            <Input
              id="name"
              autoComplete="given-name"
              placeholder="Juan"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field data-invalid={!!errors.lastname}>
            <FieldLabel htmlFor="lastname">Apellido</FieldLabel>
            <Input
              id="lastname"
              autoComplete="family-name"
              placeholder="Pérez"
              aria-invalid={!!errors.lastname}
              {...register("lastname")}
            />
            <FieldError errors={[errors.lastname]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="juan@ejemplo.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.phone}>
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
      </fieldset>

      <FieldError errors={[errors.root?.server]} />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Enviando…" : "Recibir enlace por correo"}
      </Button>
    </form>
  );
}
