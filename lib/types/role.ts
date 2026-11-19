/**
 * Tipo para la entidad Role
 * Basado en la tabla public.roles
 */
export type RoleName = "donor" | "institution";

export type Role = {
  id: string; // uuid
  name: RoleName;
};

