"use client";

import { useQuery } from "@tanstack/react-query";
import { Donation } from "@/lib/types";

interface UseDonationsOptions {
  enabled?: boolean; // Para controlar si se debe hacer fetch automáticamente
  donorId?: string; // ID del donante para filtrar donaciones (opcional)
}

interface UseDonationsReturn {
  donations: Donation[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para manejar el estado de las donaciones y proporcionar función de refetch
 * Implementado con TanStack Query para caché automático, deduplicación y revalidación
 * 
 * @param options - Opciones del hook
 * @param options.enabled - Si se debe hacer fetch automáticamente (default: true)
 * @param options.donorId - ID del donante para filtrar donaciones (opcional). Si no se provee, devuelve todas las donaciones
 * 
 * @returns {UseDonationsReturn} Objeto con donations, loading, error y refetch
 */
export function useDonations(
  options: UseDonationsOptions = { enabled: true }
): UseDonationsReturn {
  const {
    data: donations = [],
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ["donations", options.donorId],
    queryFn: async () => {
      // Construir la URL con el query parameter si se proporciona donorId
      const url = options.donorId
        ? `/api/donations?donor_id=${encodeURIComponent(options.donorId)}`
        : "/api/donations";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching donations: ${response.statusText}`);
      }

      const { data } = await response.json();
      return (data || []) as Donation[];
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
    donations,
    loading: isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  };
}

