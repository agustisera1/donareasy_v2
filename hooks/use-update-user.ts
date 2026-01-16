"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDonor, updateInstitution } from "@/actions/user/update";
import { toast } from "sonner";
import {
  type DonorEditFormSchema,
  type InstitutionEditFormSchema,
} from "@/lib/validations";
import { DonorData, InstitutionData } from "@/app/api/user/route";

interface UseUpdateUserReturn {
  updateUser: (
    data: DonorEditFormSchema | InstitutionEditFormSchema,
    user: DonorData | InstitutionData | null
  ) => Promise<boolean>; // Retorna true si fue exitoso, false si hubo error
  isLoading: boolean;
}

/**
 * Hook para manejar la actualización de datos del usuario
 * Implementado con TanStack Query para invalidación automática de caché
 * Los toasts se manejan automáticamente dentro del hook
 */
export function useUpdateUser(): UseUpdateUserReturn {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      data,
      user,
    }: {
      data: DonorEditFormSchema | InstitutionEditFormSchema;
      user: DonorData | InstitutionData;
    }) => {
      const userId = user.user_id;
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario.");
      }

      let result;

      if (user.role === "donor") {
        result = await updateDonor(data as DonorEditFormSchema, userId);
      } else if (user.role === "institution") {
        result = await updateInstitution(
          data as InstitutionEditFormSchema,
          userId
        );
      } else {
        throw new Error("Tipo de usuario no reconocido.");
      }

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar datos");
      }

      return result;
    },
    onSuccess: () => {
      // Invalidar la query de usuario para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Datos actualizados!", {
        description: "Los cambios se han guardado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar datos", {
        description: error.message,
      });
    },
  });

  const updateUser = async (
    data: DonorEditFormSchema | InstitutionEditFormSchema,
    user: DonorData | InstitutionData | null
  ): Promise<boolean> => {
    if (!user) {
      toast.error("Error", {
        description: "No hay datos de usuario disponibles.",
      });
      return false;
    }

    try {
      await mutation.mutateAsync({ data, user });
      return true;
    } catch {
      // El error ya se maneja en onError del mutation
      return false;
    }
  };

  return {
    updateUser,
    isLoading: mutation.isPending,
  };
}
