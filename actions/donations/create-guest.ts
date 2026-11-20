"use server";

import { guestAttachmentPrefix, isAttachmentOf } from "@/lib/policies/attachment";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { createAdminClient } from "@/lib/supabase/admin";
import { createGuestDonationSchema, type CreateGuestDonationInput } from "@/lib/validations";
import { getGuestToken } from "@/queries/guest/get-guest-token";

// SQLSTATE que levanta `create_guest_donation` (migración 20261120160000).
const GUEST_TOKEN_NOT_FOUND = "GT001";
const GUEST_TOKEN_USED = "GT002";
const GUEST_TOKEN_EXPIRED = "GT003";

export type GuestDonationOutcome = { status: "created" } | { status: "expired" };

// Excepción pública de `authorize`: el token del link es la credencial y se valida primero.
export async function createGuestDonation(
  input: CreateGuestDonationInput,
): Promise<ServiceResult<GuestDonationOutcome>> {
  const parsed = createGuestDonationSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);
  const data = parsed.data;

  const token = await getGuestToken(data.token);
  if (!token.ok) return token;
  if (token.data.state === "expired") return { ok: true, data: { status: "expired" } };
  if (token.data.state === "used") return fail("CONFLICT", "Este enlace ya fue utilizado");
  if (!isAttachmentOf(data.attachment.path, guestAttachmentPrefix(token.data.id)))
    return fail("VALIDATION", "La imagen no es válida");

  const supabase = createAdminClient();

  if (data.institutionId) {
    const { data: institution, error } = await supabase
      .from("institutions")
      .select("id")
      .eq("id", data.institutionId)
      .eq("approved", true)
      .maybeSingle();
    if (error) return unexpected("[createGuestDonation] institution", error);
    if (!institution) return fail("NOT_FOUND", "Institución no encontrada");
  }

  const { data: file } = supabase.storage.from("donations").getPublicUrl(data.attachment.path);
  const { error } = await supabase.rpc("create_guest_donation", {
    p_token: data.token,
    p_institution_id: data.institutionId,
    p_delivery_method: data.deliveryMethod,
    p_category: data.category,
    p_name: data.name || null,
    p_description: data.description || null,
    p_amount: data.amount,
    p_attachment_url: file.publicUrl,
    p_attachment_name: data.attachment.name || null,
  });

  // Dos envíos del mismo link: el segundo pierde el lock y ve el token usado o vencido.
  if (error?.code === GUEST_TOKEN_USED) return fail("CONFLICT", "Este enlace ya fue utilizado");
  if (error?.code === GUEST_TOKEN_EXPIRED) return { ok: true, data: { status: "expired" } };
  if (error?.code === GUEST_TOKEN_NOT_FOUND)
    return fail("NOT_FOUND", "Este enlace no existe o ya no es válido");
  if (error) return unexpected("[createGuestDonation] rpc", error);

  return { ok: true, data: { status: "created" } };
}
