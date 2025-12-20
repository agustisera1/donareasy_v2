import * as z from "zod";
import {
  institutionNameSchema,
  directorSchema,
  addressSchema,
  provinceSchema,
  citySchema,
  phoneSchema,
  foundationDateSchema,
  bankSchema,
  loreSchema,
} from "./common";

// Schema completo para el formulario de onboarding de institution
export const institutionSchema = z.object({
  name: institutionNameSchema,
  director: directorSchema,
  address: addressSchema,
  province: provinceSchema,
  city: citySchema,
  phone: phoneSchema,
  foundation_date: foundationDateSchema,
  bank: bankSchema,
  lore: loreSchema,
});

// Schema para el formulario de edición de institution (sin el campo "name" que no es editable)
export const institutionEditSchema = z.object({
  director: directorSchema,
  address: addressSchema,
  province: provinceSchema,
  city: citySchema,
  phone: phoneSchema,
  bank: bankSchema,
  lore: loreSchema,
});

// Tipo inferido del schema
export type InstitutionFormSchema = z.infer<typeof institutionSchema>;
export type InstitutionEditFormSchema = z.infer<typeof institutionEditSchema>;
