"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { authorize } from "@/lib/auth/authorize";
import { donorAttachmentPrefix, guestAttachmentPrefix } from "@/lib/policies/attachment";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  uploadRequestSchema,
  type SignedUpload,
  type UploadRequestInput,
} from "@/lib/validations";
import { getGuestToken } from "@/queries/guest/get-guest-token";

const EXTENSIONS = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" } as const;

// Emite un permiso de subida por archivo: el archivo va del navegador a Storage sin pasar por Next.
export async function createUploadUrls(
  input: UploadRequestInput,
): Promise<ServiceResult<SignedUpload[]>> {
  const parsed = uploadRequestSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);
  const { guestToken, files } = parsed.data;

  const owner = guestToken ? await guestOwner(guestToken) : await donorOwner();
  if (!owner.ok) return owner;

  const { supabase, prefix } = owner.data;
  const uploads: SignedUpload[] = [];
  for (const file of files) {
    const path = `${prefix}${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
    const { data, error } = await supabase.storage.from("donations").createSignedUploadUrl(path);
    if (error) return unexpected("[createUploadUrls]", error);
    uploads.push({ path: data.path, token: data.token });
  }
  return { ok: true, data: uploads };
}

type Owner = ServiceResult<{ supabase: SupabaseClient; prefix: string }>;

async function donorOwner(): Promise<Owner> {
  const auth = await authorize("donations:create");
  if (!auth.ok) return auth;
  return { ok: true, data: { supabase: await createClient(), prefix: donorAttachmentPrefix(auth.data.entityId) } };
}

async function guestOwner(token: string): Promise<Owner> {
  const result = await getGuestToken(token);
  if (!result.ok) return result;
  if (result.data.state !== "valid") return fail("CONFLICT", "Este enlace ya no es válido");
  return { ok: true, data: { supabase: createAdminClient(), prefix: guestAttachmentPrefix(result.data.id) } };
}
