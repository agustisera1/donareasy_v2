/**
 * Tipo para la entidad Institution
 * Basado en la tabla public.institutions
 */
export type Institution = {
  id: string; // uuid
  name: string; // text
  director: string; // text
  address: string; // character varying
  province: string; // text
  city: string; // text
  phone: string; // text
  foundation_date: string; // date (default: now())
  bank: string | null; // text (nullable)
  lore: string | null; // character varying (nullable)
  user_id: string | null; // uuid (nullable, UNIQUE)
};

