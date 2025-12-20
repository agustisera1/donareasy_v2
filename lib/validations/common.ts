import * as z from "zod";

// Validaciones comunes reutilizables

export const nameSchema = z
  .string()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre no puede exceder 100 caracteres");

export const institutionNameSchema = z
  .string()
  .min(3, "El nombre de la institución debe tener al menos 3 caracteres")
  .max(200, "El nombre no puede exceder 200 caracteres");

export const lastnameSchema = z
  .string()
  .min(2, "El apellido debe tener al menos 2 caracteres")
  .max(100, "El apellido no puede exceder 100 caracteres");

export const dniSchema = z
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
  );

export const addressSchema = z
  .string()
  .min(5, "La dirección debe tener al menos 5 caracteres")
  .max(200, "La dirección no puede exceder 200 caracteres");

export const provinceSchema = z
  .string()
  .min(2, "La provincia es requerida")
  .max(100, "La provincia no puede exceder 100 caracteres");

export const citySchema = z
  .string()
  .min(2, "La ciudad es requerida")
  .max(100, "La ciudad no puede exceder 100 caracteres");

export const phoneSchema = z
  .string()
  .min(10, "El teléfono debe tener al menos 10 caracteres")
  .max(20, "El teléfono no puede exceder 20 caracteres")
  .regex(
    /^[\d\s\+\-\(\)]+$/,
    "El teléfono solo puede contener números, espacios, +, - y paréntesis"
  );

export const directorSchema = z
  .string()
  .min(2, "El nombre del director debe tener al menos 2 caracteres")
  .max(100, "El nombre del director no puede exceder 100 caracteres");

export const foundationDateSchema = z
  .string()
  .min(1, "La fecha de fundación es requerida")
  .refine(
    (date) => {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime()) && dateObj <= new Date();
    },
    {
      message:
        "La fecha de fundación debe ser una fecha válida y no puede ser futura",
    }
  );

export const bankSchema = z
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
  );

export const loreSchema = z
  .string()
  .max(2000, "La descripción no puede exceder 2000 caracteres")
  .optional();

