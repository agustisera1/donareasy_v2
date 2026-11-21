import "server-only";

import { unexpected, type ServiceResult } from "@/lib/shared/result";
import type { createClient } from "@/lib/supabase/server";
import type {
  DeliveryMethod,
  DonationCategory,
  DonationMetrics,
  DonationStatus,
  MetricsScope,
} from "@/lib/types";
import { calculatePercentage } from "@/lib/utils";

type Supabase = Awaited<ReturnType<typeof createClient>>;

type MetricsRow = {
  status: DonationStatus;
  category: DonationCategory;
  delivery_method: DeliveryMethod;
  is_money: boolean;
  donations: number;
  amount: number | null;
};

export async function loadDonationMetrics(
  supabase: Supabase,
  scope: MetricsScope,
  institutionId: string,
  campaignId: string | null = null,
): Promise<ServiceResult<DonationMetrics>> {
  const { data, error } = await supabase.rpc("donation_metrics", {
    p_institution_id: institutionId,
    p_campaign_id: campaignId,
  });
  if (error) return unexpected("[loadDonationMetrics]", error);
  return { ok: true, data: summarize(data as MetricsRow[], scope) };
}

function summarize(rows: MetricsRow[], scope: MetricsScope): DonationMetrics {
  const metrics: DonationMetrics = {
    scope,
    total: 0,
    byStatus: { pending: 0, accepted: 0, delivered: 0, rejected: 0 },
    byCategory: { supplies: 0, clothing: 0, food: 0, other: 0 },
    byDeliveryMethod: { pickup: 0, shipment: 0, agreement: 0, transfer: 0 },
    acceptanceRate: null,
    moneyDonations: 0,
    raised: scope === "full" ? 0 : null,
  };

  for (const row of rows) {
    const count = Number(row.donations);
    metrics.total += count;
    metrics.byStatus[row.status] += count;
    metrics.byCategory[row.category] += count;
    metrics.byDeliveryMethod[row.delivery_method] += count;
    if (!row.is_money) continue;
    metrics.moneyDonations += count;
    if (metrics.raised !== null && (row.status === "accepted" || row.status === "delivered"))
      metrics.raised += Number(row.amount ?? 0);
  }

  const { accepted, delivered, rejected } = metrics.byStatus;
  const resolved = accepted + delivered + rejected;
  if (resolved > 0) metrics.acceptanceRate = calculatePercentage(accepted + delivered, resolved, 0);

  return metrics;
}
