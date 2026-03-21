"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guestAccessSchema, type GuestAccessFormSchema } from "@/lib/validations";
import { requestGuestAccess } from "@/actions/donations/request-guest-access";

export function GuestAccessForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestAccessFormSchema>({
    resolver: zodResolver(guestAccessSchema),
  });

  const onSubmit = async (data: GuestAccessFormSchema) => {
    setServerError(null);
    const result = await requestGuestAccess(data);
    if (result.success) {
      setSubmitted(true);
    } else {
      setServerError(result.error ?? "Ocurrió un error inesperado");
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-center space-y-2">
        <p className="font-semibold text-lg">¡Revisá tu correo!</p>
        <p className="text-muted-foreground text-sm">
          Te enviamos un enlace para realizar tu donación. Tenés{" "}
          <strong>30 minutos</strong> para usarlo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Juan"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lastname">Apellido</Label>
          <Input
            id="lastname"
            {...register("lastname")}
            placeholder="Pérez"
            disabled={isSubmitting}
          />
          {errors.lastname && (
            <p className="text-sm text-red-500">{errors.lastname.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="juan@ejemplo.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="+54 11 1234 5678"
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-500">{serverError}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Enviando..." : "Recibir enlace por email"}
      </Button>
    </form>
  );
}
