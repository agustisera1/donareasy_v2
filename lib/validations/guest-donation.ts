import * as z from "zod";

import { phoneSchema } from "./common";

// Schema para solicitar acceso de invitado (paso 1 — se envía el email con el link)
export const guestAccessSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastname: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().trim().pipe(z.email("El correo electrónico no es válido")),
  phone: phoneSchema,
});

export type GuestAccessFormSchema = z.infer<typeof guestAccessSchema>;
