"use client";

import { useState, useEffect, useCallback } from "react";
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
 */
export function useUser(options: UseUserOptions = { enabled: true }): UseUserReturn {
  const [user, setUser] = useState<DonorData | InstitutionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user");
      
      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`);
      }

      const { data } = await response.json();
      setUser(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.enabled) {
      fetchUser();
    }
  }, [fetchUser, options.enabled]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}

