import * as z from "zod";
import {
  nameSchema,
  lastnameSchema,
  dniSchema,
  addressSchema,
  provinceSchema,
  citySchema,
  phoneSchema,
} from "./common";

// Schema completo para el formulario de onboarding de donor
export const donorSchema = z.object({
  name: nameSchema,
  lastname: lastnameSchema,
  dni: dniSchema,
  address: addressSchema,
  province: provinceSchema,
  city: citySchema,
  phone: phoneSchema,
});

// Schema para el formulario de edición de donor (sin cambios, mismo schema)
export const donorEditSchema = donorSchema;

// Tipo inferido del schema
export type DonorFormSchema = z.infer<typeof donorSchema>;
export type DonorEditFormSchema = z.infer<typeof donorEditSchema>;

