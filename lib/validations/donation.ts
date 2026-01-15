import * as z from "zod";

// Schema para el ID de institución
export const institutionIdSchema = z
  .string()
  .min(1, "La institución es obligatoria");

// Schema para el tipo de donación
export const donationTypeSchema = z.enum(["money", "goods"]);

// Schema para el monto (obligatorio para donaciones monetarias)
export const donationAmountSchema = z
  .string()
  .min(1, "El monto es obligatorio")
  .refine(
    (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    },
    {
      message: "El monto debe ser un número mayor a 0",
    }
  );

// Schema para el comprobante de transferencia (archivo)
// Nota: Zod no tiene soporte nativo para FileList/File, por lo que usamos z.any()
// con refinements. Esta es la práctica recomendada según la documentación de Zod.
// Referencia: https://github.com/colinhacks/zod/issues/387
export const transferReceiptSchema = z
  .any()
  .refine((files) => files && files.length > 0, {
    message: "El comprobante de transferencia es obligatorio",
  })
  .refine(
    (files) => {
      if (!files || files.length === 0) return false;
      const file = files[0];
      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
      ];
      return validTypes.includes(file.type);
    },
    {
      message: "El archivo debe ser PNG, JPG o PDF",
    }
  );

// Schema para la descripción de bienes (obligatorio para donaciones de bienes)
export const donationGoodsDescriptionSchema = z
  .string()
  .min(1, "La descripción es obligatoria")
  .max(200, "La descripción no puede exceder 200 caracteres");

// Schema completo para el formulario de creación de donación
// Usamos un schema base y luego refinamos según el tipo
export const donationSchema = z
  .object({
    institution_id: institutionIdSchema,
    donation_type: donationTypeSchema,
    amount: z.string().optional().or(z.literal("")),
    transfer_receipt: z.any().nullable().optional(),
    type: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Si es donación monetaria, amount es obligatorio
      if (data.donation_type === "money") {
        if (!data.amount || data.amount.trim() === "") {
          return false;
        }
        const num = parseFloat(data.amount);
        if (isNaN(num) || num <= 0) {
          return false;
        }
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
      // transfer_receipt es obligatorio tanto para donaciones monetarias como de bienes
      return data.transfer_receipt && data.transfer_receipt.length > 0;
    },
    {
      message: "La imagen es obligatoria",
      path: ["transfer_receipt"],
    }
  )
  .refine(
    (data) => {
      // Validar el archivo para ambos tipos de donación
      if (data.transfer_receipt && data.transfer_receipt.length > 0) {
        const file = data.transfer_receipt[0];
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
      path: ["transfer_receipt"],
    }
  )
  .refine(
    (data) => {
      // Si es donación de bienes, la descripción es obligatoria
      if (data.donation_type === "goods") {
        return data.type && data.type.trim() !== "";
      }
      return true;
    },
    {
      message: "La descripción es obligatoria para donaciones de bienes",
      path: ["type"],
    }
  );

// Tipo inferido del schema
export type DonationFormSchema = z.infer<typeof donationSchema>;

// Schema para edición de donación (sin institution_id ni donation_type)
// En edición, el archivo es opcional (solo se actualiza si se sube uno nuevo)
export const donationEditSchema = z
  .object({
    amount: z.string().optional().or(z.literal("")),
    transfer_receipt: z.any().nullable().optional(),
    type: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Si hay amount, debe ser válido
      if (data.amount && data.amount.trim() !== "") {
        const num = parseFloat(data.amount);
        if (isNaN(num) || num <= 0) {
          return false;
        }
      }
      return true;
    },
    {
      message: "El monto debe ser un número mayor a 0",
      path: ["amount"],
    }
  )
  .refine(
    (data) => {
      // Si hay transfer_receipt, validar el archivo
      if (data.transfer_receipt && data.transfer_receipt.length > 0) {
        const file = data.transfer_receipt[0];
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
      path: ["transfer_receipt"],
    }
  );

// Tipo inferido del schema de edición
export type DonationEditFormSchema = z.infer<typeof donationEditSchema>;
