import * as z from "zod";

const campaignFields = {
  type: z
    .string()
    .trim()
    .min(1, "El nombre de la campaña es requerido")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres"),
  quantity: z.string().trim().max(100, "La cantidad no puede exceder 100 caracteres").optional(),
  termination_date: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isTodayOrLater(value), {
      message: "La fecha de finalización debe ser válida y no puede ser anterior a hoy",
    }),
};

function isTodayOrLater(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

const campaignIdSchema = z.uuid("Campaña inválida");

export const createCampaignSchema = z.object(campaignFields);
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const updateCampaignSchema = z.object({ campaignId: campaignIdSchema, ...campaignFields });
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

export const finishCampaignSchema = z.object({ campaignId: campaignIdSchema });
export type FinishCampaignInput = z.infer<typeof finishCampaignSchema>;
