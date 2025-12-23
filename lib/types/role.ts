/**
 * Tipo para la entidad Role
 * Basado en la tabla public.roles
 */
export type Role = {
  id: string; // uuid
  name: string; // text (default: 'donnor'::text)
};

