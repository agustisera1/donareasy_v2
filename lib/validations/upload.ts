import * as z from "zod";

// Mismos topes que el bucket `donations` (migración 20261120150000).
export const ATTACHMENT_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const MAX_FILES_PER_UPLOAD = 20;

const MIME_MESSAGE = "La imagen debe ser PNG, JPG o WebP";
const SIZE_MESSAGE = "La imagen no puede pesar más de 5 MB";

export const attachmentFileSchema = z
  .file("La imagen es obligatoria")
  .mime([...ATTACHMENT_MIME_TYPES], MIME_MESSAGE)
  .max(ATTACHMENT_MAX_BYTES, SIZE_MESSAGE);

export const uploadRequestSchema = z.object({
  guestToken: z.uuid("Enlace inválido").optional(),
  files: z
    .array(
      z.object({
        type: z.enum(ATTACHMENT_MIME_TYPES, MIME_MESSAGE),
        size: z.int().positive().max(ATTACHMENT_MAX_BYTES, SIZE_MESSAGE),
      }),
    )
    .min(1, "No hay archivos para subir")
    .max(MAX_FILES_PER_UPLOAD, `Se pueden subir hasta ${MAX_FILES_PER_UPLOAD} imágenes a la vez`),
});
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;

export type SignedUpload = { path: string; token: string };
