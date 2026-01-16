"use client";

import { useQuery } from "@tanstack/react-query";
import { Institution } from "@/lib/types";

interface UseInstitutionsOptions {
  enabled?: boolean; // Para controlar si se debe hacer fetch automáticamente
}

interface UseInstitutionsReturn {
  institutions: Institution[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para manejar el estado de las instituciones y proporcionar función de refetch
 * Implementado con TanStack Query para caché automático, deduplicación y revalidación
 * 
 * @param options - Opciones del hook
 * @param options.enabled - Si se debe hacer fetch automáticamente (default: true)
 * 
 * @returns {UseInstitutionsReturn} Objeto con institutions, loading, error y refetch
 */
export function useInstitutions(
  options: UseInstitutionsOptions = { enabled: true }
): UseInstitutionsReturn {
  const {
    data: institutions = [],
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      const response = await fetch("/api/institutions");

      if (!response.ok) {
        throw new Error(`Error fetching institutions: ${response.statusText}`);
      }

      const data = await response.json();
      return (data || []) as Institution[];
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
    institutions,
    loading: isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  };
}
