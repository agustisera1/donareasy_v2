"use server";

import { createServerClient } from "@supabase/ssr";
import { guestDonationSchema } from "@/lib/validations";

function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { persistSession: false },
    }
  );
}

export async function createGuestDonation(
  token: string,
  formData: {
    institution_id?: string | null;
    open_donation: boolean;
    donation_type: "money" | "goods";
    delivery_method: "pickup" | "shipment" | "agreement" | "transfer";
    category: "supplies" | "clothing" | "food" | "other";
    amount?: string;
    name?: string;
    description?: string;
    attachment_name?: FileList | null;
  }
) {
  const parsed = guestDonationSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = createServiceRoleClient();

  try {
    // 1. Validar el token
    const { data: tokenRow, error: tokenError } = await supabase
      .from("guest_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (tokenError) throw new Error(tokenError.message);

    if (!tokenRow) {
      return { success: false, error: "Token inválido" };
    }

    if (tokenRow.used_at) {
      return { success: false, error: "Este enlace ya fue utilizado" };
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return { success: false, error: "expired" };
    }

    // 2. Insertar el donor invitado
    const { data: donor, error: donorError } = await supabase
      .from("donors")
      .insert({
        name: tokenRow.name,
        lastname: tokenRow.lastname,
        email: tokenRow.email,
        phone: tokenRow.phone,
        is_guest: true,
        user_id: null,
      })
      .select("id")
      .single();

    if (donorError || !donor) {
      throw new Error(donorError?.message ?? "Error creando el donante");
    }

    // 3. Subir el archivo usando el cliente con service role
    const data = parsed.data;
    let attachmentUrl = "";
    let attachmentFileName = "";

    if (data.attachment_name && data.attachment_name.length > 0) {
      const file = data.attachment_name[0] as File;
      const fileExt = file.name.split(".").pop();
      const baseName =
        data.donation_type === "goods" && data.name
          ? data.name
          : file.name.replace(/\.[^/.]+$/, "");
      const cleanName = baseName
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()
        .substring(0, 50);
      const fileName = `guest-${cleanName}-${Date.now()}.${fileExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("donations")
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("donations").getPublicUrl(fileName);

      attachmentUrl = publicUrl;
      attachmentFileName = file.name;
    }

    // 4. Insertar la donación
    const { error: donationError } = await supabase
      .from("donations")
      .insert({
        donor_id: donor.id,
        institution_id: data.open_donation
          ? null
          : data.institution_id || null,
        attachment_url: attachmentUrl,
        attachment_name: attachmentFileName || null,
        status: "pending",
        delivery_method: data.delivery_method,
        category: data.category,
        name: data.donation_type === "goods" ? data.name || null : null,
        description:
          data.donation_type === "goods" ? data.description || null : null,
        amount:
          data.donation_type === "money" && data.amount
            ? parseFloat(data.amount)
            : null,
      });

    if (donationError) {
      throw new Error(`Error creando donación: ${donationError.message}`);
    }

    // 5. Marcar el token como usado
    await supabase
      .from("guest_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    return { success: true };
  } catch (error) {
    console.error("Error in createGuestDonation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
