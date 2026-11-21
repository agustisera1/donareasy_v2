"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMetrics } from "./fetch-metrics";
import { metricsKeys } from "./metrics-keys";

export function useInstitutionMetrics(institutionId: string, enabled: boolean) {
  return useQuery({
    queryKey: metricsKeys.institution(institutionId),
    queryFn: () => fetchMetrics(`/api/institutions/${institutionId}/metrics`),
    enabled,
  });
}
