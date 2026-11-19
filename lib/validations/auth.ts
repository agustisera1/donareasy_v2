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
const newPassword = z.string().min(6, "La contraseña debe tener al menos 6 caracteres");

const passwordsMatch = (data: { password: string; repeatPassword: string }) =>
  data.password === data.repeatPassword;
const mismatch = { message: "Las contraseñas no coinciden", path: ["repeatPassword"] };

export const signUpSchema = z
  .object({ email, password: newPassword, repeatPassword: z.string() })
  .refine(passwordsMatch, mismatch);

export type SignUpInput = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({ email });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const updatePasswordSchema = z
  .object({ password: newPassword, repeatPassword: z.string() })
  .refine(passwordsMatch, mismatch);

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
