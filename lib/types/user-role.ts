/**
 * Tipo para la entidad UserRole
 * Basado en la tabla public.user_roles
 */
export type UserRole = {
  id: string; // uuid
  user_id: string; // uuid (UNIQUE)
  role_id: string; // uuid
};

