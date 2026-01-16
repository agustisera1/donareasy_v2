"use client";

import { useQuery } from "@tanstack/react-query";
import { DonorData, InstitutionData } from "@/app/api/user/route";

interface UseUserOptions {
  enabled?: boolean; // Para controlar si se debe hacer fetch automáticamente
}

interface UseUserReturn {
  user: DonorData | InstitutionData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para manejar el estado del usuario y proporcionar función de refetch
 * Implementado con TanStack Query para caché automático, deduplicación y revalidación
 *
 * @param options - Opciones del hook
 * @param options.enabled - Si se debe hacer fetch automáticamente (default: true)
 *
 * @returns {UseUserReturn} Objeto con user, loading, error y refetch
 */
export function useUser(
  options: UseUserOptions = { enabled: true }
): UseUserReturn {
  const {
    data: user = null,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/user");

      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`);
      }

      const { data } = await response.json();
      return data as DonorData | InstitutionData;
    },
    enabled: options.enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos - datos del usuario cambian menos frecuentemente
    gcTime: 10 * 60 * 1000, // 10 minutos - tiempo en caché
  });

  // Wrapper para refetch que mantiene la misma firma que antes
  const refetch = async () => {
    await queryRefetch();
  };

  return {
    user,
    loading: isLoading,
    error:
      error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  };
}
