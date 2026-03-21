import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

/**
 * Calcula el porcentaje de un valor respecto a un total
 * @param count - Valor a calcular el porcentaje
 * @param total - Valor total de referencia
 * @param decimals - Número de decimales a redondear (default: 2)
 * @returns Porcentaje redondeado a los decimales especificados
 */
export function calculatePercentage(
  count: number,
  total: number,
  decimals: number = 2
): number {
  if (total === 0) return 0;
  const multiplier = Math.pow(10, decimals);
  return Math.round((count / total) * 100 * multiplier) / multiplier;
}

/**
 * Formatea un número como moneda en formato argentino
 * @param amount - Cantidad a formatear
 * @returns String formateado como moneda (ej: "$1.234,56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
