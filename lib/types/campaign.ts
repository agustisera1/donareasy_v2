/**
 * Tipo para la entidad Campaign
 * Basado en la tabla public.campaigns
 */
export type Campaign = {
  id: string; // uuid
  start_date: string; // date (YYYY-MM-DD)
  termination_date: string | null; // date (YYYY-MM-DD, nullable)
  type: string; // text
  description: string; // text
  quantity: string | null; // text (nullable)
  institution_id: string; // uuid
  finished: boolean | null; // boolean (nullable)
};

