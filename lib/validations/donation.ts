import * as z from "zod";

import { attachmentFileSchema } from "./upload";

export const donationTypeSchema = z.enum(["money", "goods"]);
export const deliveryMethodSchema = z.enum(["pickup", "shipment", "agreement", "transfer"]);
export const categorySchema = z.enum(["supplies", "clothing", "food", "other"]);

// ---------- Form (crear, editar e invitado) ----------

const donationFormFields = z.object({
  donationType: donationTypeSchema,
  openDonation: z.boolean(),
  institutionId: z.string(),
  deliveryMethod: deliveryMethodSchema,
  category: categorySchema,
  amount: z.string().trim(),
  name: z.string().trim().max(200, "El nombre no puede exceder 200 caracteres"),
  description: z.string().trim().max(200, "La descripción no puede exceder 200 caracteres"),
  attachment: attachmentFileSchema.nullable(),
});

type ContentFields = Pick<
  z.infer<typeof donationFormFields>,
  "donationType" | "amount" | "description"
>;

function refineContent(data: ContentFields, ctx: z.RefinementCtx) {
  if (data.donationType === "money" && !(Number(data.amount) > 0))
    ctx.addIssue({ code: "custom", path: ["amount"], message: "El monto debe ser un número mayor a 0" });
  if (data.donationType === "goods" && !data.description)
    ctx.addIssue({ code: "custom", path: ["description"], message: "La descripción es obligatoria" });
}

export const donationFormSchema = donationFormFields.superRefine((data, ctx) => {
  refineContent(data, ctx);
  if (!data.openDonation && !data.institutionId)
    ctx.addIssue({ code: "custom", path: ["institutionId"], message: "La institución es obligatoria" });
  if (!data.attachment)
    ctx.addIssue({ code: "custom", path: ["attachment"], message: "La imagen es obligatoria" });
});
export type DonationFormValues = z.infer<typeof donationFormSchema>;

// En edición el tipo y la institución no cambian, y la imagen solo se reemplaza si se elige otra.
export const editDonationFormSchema = donationFormFields.superRefine(refineContent);

// ---------- Input de las actions ----------

const donationContentInput = z.object({
  deliveryMethod: deliveryMethodSchema,
  category: categorySchema,
  name: z.string().trim().max(200).nullable(),
  description: z.string().trim().max(200).nullable(),
  amount: z.number().positive("El monto debe ser mayor a 0").nullable(),
});

const attachmentInput = z.object({
  path: z.string().min(1, "La imagen es obligatoria").max(300),
  name: z.string().trim().max(200),
});

export const createDonationSchema = donationContentInput
  .extend({
    institutionId: z.uuid("Institución inválida").nullable(),
    campaignId: z.uuid("Campaña inválida").optional(),
    attachment: attachmentInput,
  })
  .refine((data) => !data.campaignId || data.institutionId, {
    message: "Una donación a una campaña va dirigida a su institución",
    path: ["institutionId"],
  });
export type CreateDonationInput = z.infer<typeof createDonationSchema>;

export const updateDonationSchema = donationContentInput.extend({
  donationId: z.int().positive("Donación inválida"),
  attachment: attachmentInput.optional(),
});
export type UpdateDonationInput = z.infer<typeof updateDonationSchema>;

export const donationIdSchema = z.object({ donationId: z.int().positive("Donación inválida") });
export type DonationIdInput = z.infer<typeof donationIdSchema>;

export const rejectDonationSchema = donationIdSchema.extend({
  reason: z
    .string()
    .trim()
    .min(10, "El motivo debe tener al menos 10 caracteres")
    .max(200, "El motivo no puede exceder 200 caracteres"),
});
export type RejectDonationInput = z.infer<typeof rejectDonationSchema>;

export const createGuestDonationSchema = donationContentInput.extend({
  token: z.uuid("Enlace inválido"),
  institutionId: z.uuid("Institución inválida").nullable(),
  attachment: attachmentInput,
});
export type CreateGuestDonationInput = z.infer<typeof createGuestDonationSchema>;
