/**
 * Tipo para la entidad Donation
 * Basado en la tabla public.donations
 */
export type Donation = {
  id: number; // bigint GENERATED ALWAYS AS IDENTITY
  date_created: string; // timestamp with time zone NOT NULL DEFAULT now()
  date_accepted: string | null; // timestamp with time zone (nullable)
  date_cancelled: string | null; // timestamp with time zone (nullable)
  cancellation_reason: string | null; // character varying (nullable)
  dellivered_date: string | null; // timestamp with time zone (nullable) - Note: typo in DB schema
  name: string | null; // text (nullable)
  description: string | null; // text (nullable)
  amount: number | null; // numeric (nullable)
  attachment_name: string | null; // text (nullable)
  donnor_id: string; // uuid NOT NULL - Note: typo in DB schema (should be donor_id)
  attachment_url: string; // text NOT NULL
  status: "accepted" | "rejected" | "pending" | "delivered"; // text DEFAULT 'pending'::text
  institution_id: string; // uuid NOT NULL
  donor: string; // WARNING: This is a string concatenation of the donor's name and lastname when retrieving from the database after joining with the DONOR TABLE
};
