"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Limpiar el cache de TanStack Query, especialmente el del usuario
    queryClient.removeQueries({ queryKey: ["user"] });
    queryClient.clear(); // Limpiar todo el cache para evitar datos de sesión anterior
    router.push("/auth/login");
  };

  return <Button onClick={logout}>Cerrar Sesión</Button>;
}
