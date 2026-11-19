import type { AuthError } from "@supabase/supabase-js";

const MESSAGES: Partial<Record<string, string>> = {
  invalid_credentials: "Email o contraseña incorrectos",
  email_not_confirmed: "Confirmá tu email desde el link que te enviamos",
  user_already_exists: "Ya existe una cuenta con ese email",
  email_exists: "Ya existe una cuenta con ese email",
  weak_password: "La contraseña es muy débil",
  same_password: "La nueva contraseña tiene que ser distinta de la actual",
  session_not_found: "El link venció. Pedí uno nuevo para cambiar tu contraseña",
  email_address_invalid: "Ingresá un email válido",
  email_address_not_authorized: "No se pueden enviar mails a esa dirección",
  over_email_send_rate_limit: "Se enviaron demasiados mails. Probá de nuevo en un rato",
  over_request_rate_limit: "Demasiados intentos. Probá de nuevo en un rato",
};

export function authErrorMessage(error: AuthError) {
  return (error.code && MESSAGES[error.code]) || "No se pudo completar la operación";
}
