import { ChartLine } from "lucide-react";

import { BreakdownList, toBreakdownItems } from "@/components/common/breakdown-list";
import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { donationStatusTranslations } from "@/lib/constants";
import type { DonationMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function CampaignMetrics({ metrics }: { metrics: DonationMetrics }) {
  if (metrics.total === 0)
    return (
      <EmptyState
        icon={<ChartLine />}
        title="Todavía no hay donaciones"
        description="Las métricas aparecen cuando la campaña reciba su primera donación."
      />
    );
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Donaciones recibidas" value={metrics.total} />
        <StatCard
          label="Tasa de aceptación"
          value={metrics.acceptanceRate === null ? "—" : `${metrics.acceptanceRate}%`}
        />
        {metrics.raised === null ? (
          <StatCard label="Donaciones de dinero" value={metrics.moneyDonations} />
        ) : (
          <StatCard
            label="Fondos recaudados"
            value={formatCurrency(metrics.raised)}
            hint={`${metrics.moneyDonations} donación(es) de dinero`}
          />
        )}
      </div>
      <BreakdownList
        title="Por estado"
        items={toBreakdownItems(metrics.byStatus, donationStatusTranslations)}
        total={metrics.total}
      />
    </div>
  );
}
