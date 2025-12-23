import * as z from "zod";

// Schema para el tipo de campaña
export const campaignTypeSchema = z
  .string()
  .min(1, "El tipo de campaña es requerido")
  .max(50, "El tipo de campaña no puede exceder 50 caracteres");

// Schema para la descripción de la campaña
export const campaignDescriptionSchema = z
  .string()
  .min(10, "La descripción debe tener al menos 10 caracteres")
  .max(2000, "La descripción no puede exceder 2000 caracteres");

// Schema para la cantidad (opcional)
export const campaignQuantitySchema = z
  .string()
  .max(100, "La cantidad no puede exceder 100 caracteres")
  .optional()
  .or(z.literal(""));

// Schema para la fecha de terminación (opcional)
export const campaignTerminationDateSchema = z
  .string()
  .optional()
  .refine(
    (date) => {
      if (!date || date === "") return true; // Opcional
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return false; // Fecha inválida
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateObj.setHours(0, 0, 0, 0);
      return dateObj >= today; // Debe ser hoy o futura
    },
    {
      message: "La fecha de terminación debe ser válida y no puede ser anterior a hoy",
    }
  );

// Schema completo para el formulario de creación de campaña
export const campaignSchema = z.object({
  type: campaignTypeSchema,
  description: campaignDescriptionSchema,
  quantity: campaignQuantitySchema,
  termination_date: campaignTerminationDateSchema,
});

// Tipo inferido del schema
export type CampaignFormSchema = z.infer<typeof campaignSchema>;

