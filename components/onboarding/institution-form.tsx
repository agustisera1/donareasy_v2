"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { createInstitution } from "@/actions/user/create";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  institutionSchema,
  type InstitutionFormSchema,
} from "@/lib/validations";

type InstitutionFormData = InstitutionFormSchema;

export function InstitutionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
  });

  const onSubmit = async (data: InstitutionFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: user, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(`Error getting user: ${userError.message}`);
      }

      const userId = user.user?.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      // Llamar al server action
      const result = await createInstitution(data, userId);

      if (!result.success) {
        throw new Error(result.error || "Error al crear la institución");
      }

      // Redirigir al dashboard después de éxito
      router.push("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocurrió un error inesperado";
      setError(errorMessage);
      console.error("Error submitting form:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl shadow-none">
      <CardHeader>
        <CardTitle>Información de la Institución</CardTitle>
        <CardDescription>
          Te pedimos algunos datos para registrarte como institución
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="institution-name">Nombre de la Institución</Label>
            <Input
              id="institution-name"
              {...register("name")}
              placeholder="Fundación Ayuda Social"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="director">Director a Cargo</Label>
            <Input
              id="director"
              {...register("director")}
              placeholder="Juan Pérez"
            />
            {errors.director && (
              <p className="text-sm text-red-500">{errors.director.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="institution-address">Dirección</Label>
            <Input
              id="institution-address"
              {...register("address")}
              placeholder="Av. Principal 456"
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="institution-province">Provincia</Label>
              <Input
                id="institution-province"
                {...register("province")}
                placeholder="Santa Fe"
              />
              {errors.province && (
                <p className="text-sm text-red-500">
                  {errors.province.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="institution-city">Ciudad</Label>
              <Input
                id="institution-city"
                {...register("city")}
                placeholder="Rosario"
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="institution-phone">Teléfono</Label>
              <Input
                id="institution-phone"
                {...register("phone")}
                placeholder="+54 11 1234-5678"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="foundation-date">Fecha de Fundación</Label>
              <Input
                id="foundation-date"
                type="date"
                {...register("foundation_date")}
              />
              {errors.foundation_date && (
                <p className="text-sm text-red-500">
                  {errors.foundation_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bank">CBU o Alias</Label>
            <Input id="bank" {...register("bank")} />
            {errors.bank && (
              <p className="text-sm text-red-500">{errors.bank.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lore">Acerca de tu institución</Label>
            <Textarea
              id="lore"
              {...register("lore", { required: false })}
              placeholder="Contanos sobre la misma: A qué se dedican, cuáles son sus valores, su historia..."
              rows={5}
            />
            {errors.lore && (
              <p className="text-sm text-red-500">{errors.lore.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
