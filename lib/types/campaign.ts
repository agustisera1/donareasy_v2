/**
 * Tipo para la entidad Campaign
 * Basado en la tabla public.campaigns
 */
export type Campaign = {
  id: string; // uuid
  start_date: string; // timestamp with time zone
  termination_date: string | null; // timestamp with time zone (nullable)
  type: string; // text
  description: string; // text
  quantity: string | null; // text (nullable)
  institution_id: string; // uuid
};

