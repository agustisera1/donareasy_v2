import type { Donation } from "@/lib/types";

type DonationState = Pick<Donation, "status" | "institution_id">;

// Las abiertas (sin institución) las acepta cualquiera; las dirigidas, solo su destino.
export function isAddressedTo(donation: Pick<Donation, "institution_id">, institutionId: string) {
  return donation.institution_id === null || donation.institution_id === institutionId;
}

export const canAccept = (donation: DonationState, institutionId: string) =>
  donation.status === "pending" && isAddressedTo(donation, institutionId);

// Una abierta no se rechaza: la toma otra institución.
export const canReject = (donation: DonationState, institutionId: string) =>
  donation.status === "pending" && donation.institution_id === institutionId;

export const canDeliver = (donation: DonationState, institutionId: string) =>
  donation.status === "accepted" && donation.institution_id === institutionId;

// El donante solo edita o cancela mientras ninguna institución la tomó.
export const canEditOrCancel = (donation: Pick<Donation, "status" | "donor_id">, donorId: string) =>
  donation.status === "pending" && donation.donor_id === donorId;
