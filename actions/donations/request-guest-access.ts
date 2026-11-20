"use server";

import { Resend } from "resend";

import { guestInvitationHtml } from "@/lib/email/guest-invitation";
import { fail, unexpected, type ServiceResult } from "@/lib/shared/result";
import { createAdminClient } from "@/lib/supabase/admin";
import { guestAccessSchema, type GuestAccessFormSchema } from "@/lib/validations";

const resend = new Resend(process.env.RESEND_API_KEY);
const TOKEN_TTL_MS = 30 * 60 * 1000;

// Excepción pública de `authorize`: quien pide el link todavía no tiene cuenta.
export async function requestGuestAccess(
  input: GuestAccessFormSchema,
): Promise<ServiceResult<null>> {
  const parsed = guestAccessSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.issues[0].message);

  const { name, lastname, email, phone } = parsed.data;
  const supabase = createAdminClient();

  const { data: tokenRow, error: insertError } = await supabase
    .from("guest_tokens")
    .insert({
      name,
      lastname,
      email,
      phone,
      expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
    })
    .select("token")
    .single();
  if (insertError) return unexpected("[requestGuestAccess] token", insertError);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const magicLink = `${appUrl}/donate/${tokenRow.token}`;

  const { error: emailError } = await resend.emails.send({
    from: "Donareasy <onboarding@resend.dev>",
    to: email,
    subject: "Tu enlace para donar en Donareasy",
    html: guestInvitationHtml({ name, magicLink, baseUrl: appUrl }),
  });
  if (emailError) {
    console.error("[requestGuestAccess] email", emailError);
    return fail("UNAVAILABLE", "No pudimos enviar el correo. Probá de nuevo en unos minutos");
  }

  return { ok: true, data: null };
}
