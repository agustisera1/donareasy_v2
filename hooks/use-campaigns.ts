"use client";

import { useQuery } from "@tanstack/react-query";
import { Campaign } from "@/lib/types";

interface UseCampaignsOptions {
  enabled?: boolean; // Para controlar si se debe hacer fetch automáticamente
  userId?: string; // ID de la institución para filtrar campañas (opcional)
}

interface UseCampaignsReturn {
  campaigns: Campaign[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para manejar el estado de las campañas y proporcionar función de refetch
 * Implementado con TanStack Query para caché automático, deduplicación y revalidación
 * 
 * @param options - Opciones del hook
 * @param options.enabled - Si se debe hacer fetch automáticamente (default: true)
 * @param options.userId - ID de la institución para filtrar campañas (opcional). Si no se provee, devuelve todas las campañas
 * 
 * @returns {UseCampaignsReturn} Objeto con campaigns, loading, error y refetch
 */
export function useCampaigns(
  options: UseCampaignsOptions = { enabled: true }
): UseCampaignsReturn {
  const {
    data: campaigns = [],
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ["campaigns", options.userId],
    queryFn: async () => {
      // Construir la URL con el query parameter si se proporciona userId
      const url = options.userId
        ? `/api/campaigns?institution_id=${encodeURIComponent(options.userId)}`
        : "/api/campaigns";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching campaigns: ${response.statusText}`);
      }

      const { data } = await response.json();
      return (data || []) as Campaign[];
    },
    enabled: options.enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos - datos frescos
    gcTime: 5 * 60 * 1000, // 5 minutos - tiempo en caché
  });

  // Wrapper para refetch que mantiene la misma firma que antes
  const refetch = async () => {
    await queryRefetch();
  };

  return {
    campaigns,
    loading: isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  };
}
