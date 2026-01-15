"use server";

import { createClient } from "@/lib/supabase/server";

interface UploadFileResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

/**
 * Sube un archivo a Supabase Storage y retorna la URL pública
 * @param file - El archivo a subir
 * @param name - Nombre personalizado para el archivo (opcional). Si no se provee, se usa file.name
 * @returns URL pública del archivo subido o error
 */
export async function uploadFile(
  file: File,
  name?: string
): Promise<UploadFileResult> {
  const supabase = await createClient();

  try {
    // 1. Verificar que el usuario esté autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    // 2. Determinar el nombre del archivo
    // Si se provee un nombre personalizado, usarlo; caso contrario, usar file.name
    const fileExt = file.name.split(".").pop();
    const baseName = name || file.name.replace(/\.[^/.]+$/, "");

    // Limpiar el nombre para que sea válido como nombre de archivo
    const cleanName = baseName
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .substring(0, 50);

    const fileName = `${cleanName}-${Date.now()}.${fileExt}`;

    // 3. Convertir File a ArrayBuffer para la subida
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // 4. Subir el archivo al bucket "donations"
    const { error } = await supabase.storage
      .from("donations")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      if (error.message.includes("Bucket not found")) {
        return {
          success: false,
          error: `El bucket "donations" no existe. Por favor, créalo en el dashboard de Supabase.`,
        };
      }
      return {
        success: false,
        error: `Error al subir el archivo: ${error.message}`,
      };
    }

    // 5. Obtener la URL pública del archivo
    const {
      data: { publicUrl },
    } = supabase.storage.from("donations").getPublicUrl(fileName);

    return {
      success: true,
      url: publicUrl,
      fileName: file.name,
    };
  } catch (error) {
    console.error("Error in uploadFile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
