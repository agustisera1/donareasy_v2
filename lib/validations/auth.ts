import * as z from "zod";

const email = z
  .string()
  .trim()
  .pipe(z.email("Ingresá un email válido"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Mínimo 6: es el largo mínimo por defecto de Supabase Auth.
export const signUpSchema = z
  .object({
    email,
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Las contraseñas no coinciden",
    path: ["repeatPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
