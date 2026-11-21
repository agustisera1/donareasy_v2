"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMetrics } from "./fetch-metrics";
import { metricsKeys } from "./metrics-keys";

export function useCampaignMetrics(campaignId: string, enabled: boolean) {
  return useQuery({
    queryKey: metricsKeys.campaign(campaignId),
    queryFn: () => fetchMetrics(`/api/campaigns/${campaignId}/metrics`),
    enabled,
  });
}
