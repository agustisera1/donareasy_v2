/**
 * Tipo para la entidad Donor
 * Basado en la tabla public.donors
 */
export type Donor = {
  id: string; // uuid
  name: string; // text
  lastname: string; // text
  dni: number; // integer
  address: string; // character varying
  province: string; // text
  city: string; // text
  phone: string; // text
  user_id: string | null; // uuid (nullable, UNIQUE)
};

