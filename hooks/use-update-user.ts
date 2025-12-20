"use client";

import { useState } from "react";
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
 * Los toasts se manejan automáticamente dentro del hook
 */
export function useUpdateUser(): UseUpdateUserReturn {
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    try {
      const userId = user.user_id;
      if (!userId) {
        toast.error("Error de usuario", {
          description: "No se pudo obtener el ID del usuario.",
        });
        setIsLoading(false);
        return false;
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
        toast.error("Error", {
          description: "Tipo de usuario no reconocido.",
        });
        setIsLoading(false);
        return false;
      }

      if (result.success) {
        toast.success("Datos actualizados!", {
          description: "Los cambios se han guardado correctamente.",
        });
        return true;
      } else {
        toast.error("Error al actualizar datos", {
          description: result.error,
        });
        return false;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      toast.error("Error inesperado", {
        description: errorMessage,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUser,
    isLoading,
  };
}
