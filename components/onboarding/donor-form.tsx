"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

export const donorSchema = z.object({
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
  phone: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 caracteres")
    .max(20, "El teléfono no puede exceder 20 caracteres")
    .regex(
      /^[\d\s\+\-\(\)]+$/,
      "El teléfono solo puede contener números, espacios, +, - y paréntesis"
    ),
});

export type DonorFormSchema = z.infer<typeof donorSchema>;

type DonorFormData = DonorFormSchema;

export function DonorForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonorFormData>({
    resolver: zodResolver(donorSchema),
  });

  const onSubmit = (data: DonorFormData) => {
    // Transformar DNI de string a número para enviar a la DB
    const formData = {
      ...data,
      dni: parseInt(data.dni, 10),
    };
    console.log("form submitted", formData);
  };

  return (
    <Card className="w-full max-w-2xl shadow-none">
      <CardHeader>
        <CardTitle>Información de Donante</CardTitle>
        <CardDescription>
          Te pedimos algunos datos para registrate como donante
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...register("name")} placeholder="Juan" />
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
              />
              {errors.lastname && (
                <p className="text-sm text-red-500">
                  {errors.lastname.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              type="text"
              inputMode="numeric"
              {...register("dni")}
              placeholder="12345678"
              maxLength={8}
            />
            {errors.dni && (
              <p className="text-sm text-red-500">{errors.dni.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Zeballos 1342"
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
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
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...register("city")} placeholder="Rosario" />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+54 11 1234-5678"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Continuar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
