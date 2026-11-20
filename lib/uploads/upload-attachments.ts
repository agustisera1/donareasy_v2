import { createUploadUrls } from "@/actions/storage/create-upload-urls";
import { fail, type ServiceResult } from "@/lib/shared/result";
import { createClient } from "@/lib/supabase/client";
import type { UploadRequestInput } from "@/lib/validations";

export type UploadedAttachment = { path: string; name: string };
type UploadFileType = UploadRequestInput["files"][number]["type"];

// Pide un permiso por archivo y sube directo a Storage (Supabase "Upload to a signed URL").
export async function uploadAttachments(
  files: File[],
  guestToken?: UploadRequestInput["guestToken"],
): Promise<ServiceResult<UploadedAttachment[]>> {
  const signed = await createUploadUrls({
    guestToken,
    // El tipo lo valida el server con zod; acá solo se transporta.
    files: files.map((file) => ({ type: file.type as UploadFileType, size: file.size })),
  });
  if (!signed.ok) return signed;

  const bucket = createClient().storage.from("donations");
  const uploads = await Promise.all(
    signed.data.map(({ path, token }, i) =>
      bucket.uploadToSignedUrl(path, token, files[i], { contentType: files[i].type }),
    ),
  );
  if (uploads.some(({ error }) => error))
    return fail("UNAVAILABLE", "No se pudo subir la imagen. Probá de nuevo");

  return { ok: true, data: signed.data.map(({ path }, i) => ({ path, name: files[i].name })) };
}
