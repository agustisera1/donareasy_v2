"use client";

import { useQuery } from "@tanstack/react-query";
import { getInstitutionMetrics } from "@/actions/institutions/metrics";
import type { InstitutionMetrics } from "@/actions/institutions/metrics";

interface UseInstitutionMetricsOptions {
  institutionId: string | null;
  enabled?: boolean;
}

interface UseInstitutionMetricsReturn {
  metrics: InstitutionMetrics | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener las métricas de una institución
 * Implementado con TanStack Query para caché automático, deduplicación y revalidación
 *
 * @param options - Opciones del hook
 * @param options.institutionId - ID de la institución para obtener métricas
 * @param options.enabled - Si se debe hacer fetch automáticamente (default: true)
 *
 * @returns {UseInstitutionMetricsReturn} Objeto con metrics, loading, error y refetch
 */
export function useInstitutionMetrics(
  options: UseInstitutionMetricsOptions
): UseInstitutionMetricsReturn {
  const {
    data: metrics = null,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ["institution-metrics", options.institutionId],
    queryFn: async () => {
      if (!options.institutionId) {
        throw new Error("Institution ID is required");
      }

      const result = await getInstitutionMetrics(options.institutionId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Error fetching institution metrics");
      }

      return result.data;
    },
    enabled: options.enabled !== false && !!options.institutionId,
    staleTime: 2 * 60 * 1000, // 2 minutos - datos frescos
    gcTime: 5 * 60 * 1000, // 5 minutos - tiempo en caché
  });

  // Wrapper para refetch que mantiene la misma firma que antes
  const refetch = async () => {
    await queryRefetch();
  };

  return {
    metrics,
    loading: isLoading,
    error:
      error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  };
}
