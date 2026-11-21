import { ChartLine } from "lucide-react";

import { BreakdownList, toBreakdownItems } from "@/components/common/breakdown-list";
import { EmptyState } from "@/components/common/empty-state";
import { StatCard } from "@/components/common/stat-card";
import { categoryLabels, deliveryMethodLabels, donationStatusTranslations } from "@/lib/constants";
import type { DonationMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function InstitutionMetrics({ metrics }: { metrics: DonationMetrics }) {
  if (metrics.total === 0)
    return (
      <EmptyState
        icon={<ChartLine />}
        title="Todavía no hay donaciones"
        description="Las métricas aparecen cuando la institución reciba su primera donación."
      />
    );
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Donaciones recibidas" value={metrics.total} />
        <StatCard
          label="Tasa de aceptación"
          value={metrics.acceptanceRate === null ? "—" : `${metrics.acceptanceRate}%`}
          hint="Aceptadas y entregadas sobre las resueltas"
        />
        {metrics.raised === null ? (
          <StatCard label="Donaciones de dinero" value={metrics.moneyDonations} />
        ) : (
          <StatCard
            label="Recaudado"
            value={formatCurrency(metrics.raised)}
            hint={`${metrics.moneyDonations} donación(es) de dinero; suma aceptadas y entregadas`}
          />
        )}
      </div>
      <BreakdownList
        title="Por estado"
        items={toBreakdownItems(metrics.byStatus, donationStatusTranslations)}
        total={metrics.total}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownList
          title="Por categoría"
          items={toBreakdownItems(metrics.byCategory, categoryLabels)}
          total={metrics.total}
        />
        <BreakdownList
          title="Por método de entrega"
          items={toBreakdownItems(metrics.byDeliveryMethod, deliveryMethodLabels)}
          total={metrics.total}
        />
      </div>
    </div>
  );
}
