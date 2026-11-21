import type { DeliveryMethod, DonationCategory, DonationStatus } from "./donation-types";

export type MetricsScope = "full" | "public";

export type DonationMetrics = {
  scope: MetricsScope;
  total: number;
  byStatus: Record<DonationStatus, number>;
  byCategory: Record<DonationCategory, number>;
  byDeliveryMethod: Record<DeliveryMethod, number>;
  /** Aceptadas + entregadas sobre las resueltas (incluye rechazadas); null si no hay resueltas. */
  acceptanceRate: number | null;
  moneyDonations: number;
  /** Solo en "full": monto de las donaciones de dinero aceptadas y entregadas. */
  raised: number | null;
};
