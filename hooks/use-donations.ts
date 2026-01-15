"use client";

import { useState, useEffect, useCallback } from "react";
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
 * @param options - Opciones del hook
 * @param options.enabled - Si se debe hacer fetch automáticamente (default: true)
 * @param options.donorId - ID del donante para filtrar donaciones (opcional). Si no se provee, devuelve todas las donaciones
 */
export function useDonations(
  options: UseDonationsOptions = { enabled: true }
): UseDonationsReturn {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Construir la URL con el query parameter si se proporciona donorId
      const url = options.donorId
        ? `/api/donations?donor_id=${encodeURIComponent(options.donorId)}`
        : "/api/donations";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error fetching donations: ${response.statusText}`);
      }

      const { data } = await response.json();
      setDonations(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  }, [options.donorId]);

  useEffect(() => {
    if (options.enabled) {
      fetchDonations();
    }
  }, [fetchDonations, options.enabled]);

  return {
    donations,
    loading,
    error,
    refetch: fetchDonations,
  };
}

