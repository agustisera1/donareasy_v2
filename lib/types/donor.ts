/**
 * Tipo para la entidad Donor
 * Basado en la tabla public.donors
 */
export type Donor = {
  id: string; // uuid
  name: string; // text
  lastname: string; // text
  dni: number | null; // integer (nullable for guests)
  address: string | null; // character varying (nullable for guests)
  province: string | null; // text (nullable for guests)
  city: string | null; // text (nullable for guests)
  phone: string; // text
  user_id: string | null; // uuid (nullable, UNIQUE)
  email: string | null; // text (used for guest donors)
  is_guest: boolean; // true for guest donors
};

