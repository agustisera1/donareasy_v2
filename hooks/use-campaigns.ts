"use client";

import { useState, useEffect, useCallback } from "react";
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
 * @param options - Opciones del hook
 * @param options.enabled - Si se debe hacer fetch automáticamente (default: true)
 * @param options.userId - ID de la institución para filtrar campañas (opcional). Si no se provee, devuelve todas las campañas
 */
export function useCampaigns(
  options: UseCampaignsOptions = { enabled: true }
): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Construir la URL con el query parameter si se proporciona userId
      const url = options.userId
        ? `/api/campaigns?institution_id=${encodeURIComponent(options.userId)}`
        : "/api/campaigns";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching campaigns: ${response.statusText}`);
      }

      const { data } = await response.json();
      setCampaigns(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, [options.userId]);

  useEffect(() => {
    if (options.enabled) {
      fetchCampaigns();
    }
  }, [fetchCampaigns, options.enabled]);

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
  };
}
