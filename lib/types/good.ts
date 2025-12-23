/**
 * Tipo para la entidad Good
 * Basado en la tabla public.goods
 */
export type Good = {
  id: number; // bigint GENERATED ALWAYS AS IDENTITY
  name: string; // text
  description: string; // text
  quantity: string | null; // text (nullable)
  donation_id: number; // bigint
};

