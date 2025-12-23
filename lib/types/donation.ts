/**
 * Tipo para la entidad Donation
 * Basado en la tabla public.donations
 */
export type Donation = {
  id: number; // bigint GENERATED ALWAYS AS IDENTITY
  date_created: string; // timestamp with time zone
  date_accepted: string | null; // timestamp with time zone (nullable)
  date_cancelled: string | null; // timestamp with time zone (nullable)
  cancellation_reason: string | null; // character varying (nullable)
  dellivered_date: string | null; // timestamp with time zone (nullable) - Note: typo in DB schema
  type: string | null; // text (nullable)
  amount: number | null; // numeric (nullable)
  transfer_receipt: string | null; // text (nullable)
  donnor_id: string; // uuid - Note: typo in DB schema (should be donor_id)
};

