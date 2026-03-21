import type {
  DeliveryMethod,
  DonationCategory,
  DonationStatus,
} from "./donation-types";

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
  donor_id: string; // uuid NOT NULL - Note: typo in DB schema (should be donor_id)
  attachment_url: string; // text NOT NULL
  status: DonationStatus; // text DEFAULT 'pending'::text
  delivery_method: DeliveryMethod; // text NOT NULL
  category: DonationCategory; // text NOT NULL
  institution_id: string | null; // uuid, NULL para donaciones abiertas
  donor: string; // WARNING: This is a string concatenation of the donor's name and lastname when retrieving from the database after joining with the DONOR TABLE
};
