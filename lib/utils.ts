import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Formatea una fecha en formato de string ISO a formato legible en español (Argentina)
 * @param dateString - String de fecha en formato ISO (ej: "2024-01-15T00:00:00.000Z")
 * @returns String formateado (ej: "15 de enero de 2024")
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) {
    console.warn("[formatDate]: dateString is null");
    return "";
  }
  // Si es formato YYYY-MM-DD (sin hora)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-").map(Number);
    // month - 1 porque JavaScript usa índices 0-11 para los meses
    const date = new Date(year, month - 1, day);
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  }

  // Para fechas ISO con hora
  return format(parseISO(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
}
