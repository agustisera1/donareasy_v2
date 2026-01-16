"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutos - datos frescos por defecto
            gcTime: 5 * 60 * 1000, // 5 minutos - tiempo en caché (antes cacheTime)
            refetchOnWindowFocus: false, // Evita refetch al cambiar de pestaña
            retry: 1, // Reintentar 1 vez en caso de error
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
