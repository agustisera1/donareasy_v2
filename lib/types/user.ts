/**
 * Tipo para la entidad User
 * Basado en la tabla public.users
 */
export type User = {
  id: string; // uuid
  created_at: string; // timestamp with time zone
  email: string; // text (UNIQUE)
  onboarding_complete: boolean; // boolean (default: false)
  is_active: boolean; // boolean (default: true)
};
