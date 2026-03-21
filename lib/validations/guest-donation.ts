import * as z from "zod";

// Schema para solicitar acceso de invitado (paso 1 — se envía el email con el link)
export const guestAccessSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("El correo electrónico no es válido"),
  phone: z
    .string()
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .max(20, "El teléfono no puede exceder 20 caracteres"),
});

export type GuestAccessFormSchema = z.infer<typeof guestAccessSchema>;

// Schema para el formulario de donación de invitado (paso 2 — al usar el link)
export const guestDonationSchema = z
  .object({
    institution_id: z.string().optional().or(z.literal("")),
    open_donation: z.boolean(),
    donation_type: z.enum(["money", "goods"]),
    delivery_method: z.enum(["pickup", "shipment", "agreement", "transfer"]),
    category: z.enum(["supplies", "clothing", "food", "other"]),
    amount: z.string().optional().or(z.literal("")),
    attachment_name: z.any().nullable().optional(),
    name: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.donation_type === "money") {
        if (!data.amount || data.amount.trim() === "") return false;
        const num = parseFloat(data.amount);
        if (isNaN(num) || num <= 0) return false;
      }
      return true;
    },
    {
      message: "El monto es obligatorio y debe ser un número mayor a 0",
      path: ["amount"],
    }
  )
  .refine(
    (data) => {
      return data.attachment_name && data.attachment_name.length > 0;
    },
    {
      message: "La imagen es obligatoria",
      path: ["attachment_name"],
    }
  )
  .refine(
    (data) => {
      if (data.attachment_name && data.attachment_name.length > 0) {
        const file = data.attachment_name[0];
        const validTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "application/pdf",
        ];
        return validTypes.includes(file.type);
      }
      return true;
    },
    {
      message: "El archivo debe ser PNG, JPG o PDF",
      path: ["attachment_name"],
    }
  )
  .refine(
    (data) => {
      if (data.donation_type === "goods") {
        return data.description && data.description.trim() !== "";
      }
      return true;
    },
    {
      message: "La descripción es obligatoria para donaciones de bienes",
      path: ["description"],
    }
  )
  .refine(
    (data) => {
      if (!data.open_donation) {
        return !!data.institution_id && data.institution_id.trim().length > 0;
      }
      return true;
    },
    {
      message: "La institución es obligatoria",
      path: ["institution_id"],
    }
  );

export type GuestDonationFormSchema = z.infer<typeof guestDonationSchema>;
