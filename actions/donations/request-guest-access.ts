"use server";

import { createClient } from "@/lib/supabase/server";
import { guestAccessSchema } from "@/lib/validations";
import { Resend } from "resend";
import { guestInvitationHtml } from "@/lib/email/guest-invitation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function requestGuestAccess(formData: {
  name: string;
  lastname: string;
  email: string;
  phone: string;
}) {
  const parsed = guestAccessSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.message,
    };
  }

  const { name, lastname, email, phone } = parsed.data;
  const supabase = await createClient();

  try {
    // 1. Crear el token con expiración de 30 minutos
    const { data: tokenRow, error: insertError } = await supabase
      .from("guest_tokens")
      .insert({
        name,
        lastname,
        email,
        phone,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      })
      .select("token")
      .single();

    if (insertError || !tokenRow) {
      throw new Error(insertError?.message ?? "Error creando el token");
    }

    // 2. Construir el magic link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const magicLink = `${appUrl}/donate/${tokenRow.token}`;

    // 3. Enviar el email con Resend
    const { error: emailError } = await resend.emails.send({
      from: "Donareasy <onboarding@resend.dev>",
      to: email,
      subject: "Tu enlace para donar en Donareasy",
      html: guestInvitationHtml({ name, magicLink, baseUrl: appUrl }),
    });

    if (emailError) {
      throw new Error(`Error enviando el email: ${emailError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in requestGuestAccess:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
